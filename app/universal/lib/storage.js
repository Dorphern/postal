import PubSub from 'pubsub-js'
import { openDatabase } from 'expo-sqlite'
import { useEffect, useState } from 'react'

import { guid } from './guid'

const db = openDatabase('db.db', '1.0', 'storage for postal', 1024 * 1024 * 50)

export const migrateToLatest = async () => {
  try {
    let setupDatabase = false
    await createTransaction(({ query }) => {
      query(`SELECT * FROM events LIMIT 1;`)
        .then(() => {
          setupDatabase = false
        })
        .catch(() => (setupDatabase = true))
    })

    if (setupDatabase) {
      console.log('setting up database...')
      await createTransaction(({ query }) => {
        query(`DROP TABLE IF EXISTS events;`)
        query(`
        CREATE TABLE IF NOT EXISTS events (
          id CHAR(36) PRIMARY KEY,
          eventId VARCHAR(255) UNIQUE,
          sender VARCHAR(255) NOT NULL,
          roomId VARCHAR(255) NOT NULL,
          type VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          value TEXT NOT NULL DEFAULT '{}',
          serverTimestamp UNSIGNED BIG INT,
          updatedAt UNSIGNED BIG INT
        );
      `)
      })
      console.log('setting up database, done!')
    }
  } catch (error) {
    console.log('setting up database, failed...', error)
  }
}

export const createTransaction = async fn => {
  return new Promise((resolve, reject) => {
    let result = undefined
    db.transaction(
      trx => {
        try {
          const query = (sql, args) => {
            return new Promise((resolveQuery, rejectQuery) => {
              trx.executeSql(
                sql,
                args,
                (transaction, result) => {
                  const rows = Array.from(result.rows._array || result.rows)
                  resolveQuery(rows, transaction)
                },
                (transaction, error) => rejectQuery(error, transaction),
              )
            })
          }

          const batchInsert = (table, entries) => {
            if (entries.length === 0) {
              throw new Error('Cannot insert an empty array')
            }

            const keys = ['id', 'updatedAt', ...Object.keys(entries[0])]

            const rows = entries.map(entry => {
              const newEntry = keys.map(key => {
                const value = entry[key]
                if (typeof value === 'object') {
                  return JSON.stringify(value)
                }
                if (key === 'id') {
                  return value ?? guid()
                } else if (key === 'updatedAt') {
                  return value ?? Date.now()
                } else {
                  return value
                }
              })

              return newEntry
            })

            const MAX_VALUES = 999

            const rowsPerInsert = Math.floor(MAX_VALUES / rows[0].length)
            const insertQueriesCount = Math.ceil(rows.length / rowsPerInsert)

            const insertQueries = Array(insertQueriesCount)
              .fill(null)
              .map((_, i) => {
                const insertRows = rows.slice(
                  i * rowsPerInsert,
                  (i + 1) * rowsPerInsert,
                )
                const args = insertRows.flat()

                const sqlValues = insertRows
                  .map(values => '(' + values.map(() => '?').join(',') + ')')
                  .join(',')
                const sql = `INSERT OR IGNORE INTO 
                  ${table}(${keys.join(',')}) 
                  VALUES ${sqlValues}
                `
                return query(sql, args)
              })

            return Promise.all(insertQueries)
          }

          const insert = async (table, entry) => {
            const row = {
              id: guid(),
              updatedAt: Date.now(),
              ...entry,
            }
            const keys = Object.keys(row)
            const args = keys.map(key => {
              const value = row[key]
              if (typeof value === 'object') {
                return JSON.stringify(value)
              } else {
                return value
              }
            })
            const sqlValues = '(' + keys.map(() => '?').join(',') + ')'
            const sql = `INSERT INTO 
              ${table}(${keys.join(',')}) 
              VALUES ${sqlValues}
            `

            query(sql, args)
            PubSub.publish('storage.updated')
            return row.id
          }

          const update = async (table, entry, id) => {
            const row = {
              updatedAt: Date.now(),
              ...entry,
            }
            const keys = Object.keys(row)
            const sqlValues = keys.map(key => `${key} = ?`).join(',')
            const args = [...keys.map(key => row[key]), id]
            const sql = `UPDATE ${table} SET ${sqlValues} WHERE id = ?`

            return query(sql, args)
          }

          result = fn({ query, batchInsert, insert, update })
        } catch (error) {
          console.log('Transaction error!', error)
        }
      },
      (transaction, error) => reject(error),
      () => resolve(result),
    )
  })
}

export const syncStorage = ({ events, onProgress }) => {
  return new Promise((resolve, reject) => {
    const BATCH_SIZE = 1000

    // Skip if there's no new data
    if (events.length === 0) {
      return resolve()
    }

    const batches = Math.ceil(events.length / BATCH_SIZE)
    const nextBatch = async (batchI = 0) => {
      try {
        const progress = batchI / batches
        onProgress && onProgress(progress)

        if (batchI >= batches) {
          PubSub.publish('storage.updated')
          resolve()
          return
        }

        const batch = events.slice(
          batchI * BATCH_SIZE,
          (batchI + 1) * BATCH_SIZE,
        )
        await saveEvents(batch)

        setTimeout(() => nextBatch(batchI + 1), 1)
      } catch (error) {
        reject(error)
      }
    }

    nextBatch()
  })
}

const saveEvents = async events => {
  await createTransaction(({ batchInsert }) => {
    batchInsert('events', events).catch(error => {
      console.log('error', error)
      /* do nothing */
    })
  })
}

export const useQuery = (sql, args = []) => {
  const [result, setResult] = useState([])

  useEffect(() => {
    const entriesCachedById = {}
    const run = () => {
      createTransaction(({ query }) => {
        query(sql, args).then(rows => {
          const parsedRows = rows.map(row => {
            const cachedEntry = entriesCachedById[row.id]
            if (cachedEntry?.updatedAt === row.updatedAt) {
              return cachedEntry
            }

            if (row.content) {
              row.content = JSON.parse(row.content)
            }

            if (row.value) {
              row.value = JSON.parse(row.value)
            }

            entriesCachedById[row.id] = row

            return row
          })
          setResult(parsedRows)
        })
      })
    }

    const token = PubSub.subscribe('storage.updated', run)
    run()

    return () => PubSub.unsubscribe(token)
  }, [sql, ...args])

  return result
}
