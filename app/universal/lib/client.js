import ms from 'ms'
import PubSub from 'pubsub-js'
import { createHomeserver } from './matrix/homeserver'

import { UnknownTokenError } from './matrix/errors'

import { formatSyncData } from './formatSyncData'

export const RoomInviteState = {
  Joined: 'join',
  Invited: 'invite',
  Left: 'leave',
}

const Client = {
  homeserver: null,
  pubsub: PubSub,
  async loginAndConnect({ userId, password }) {
    const { user, homeserverUrl } = destructUserId(userId)

    const homeserver = await createHomeserver({ homeserverUrl })
    const { accessToken } = await homeserver.login({ user, password })
    const auth = { homeserverUrl, accessToken, userId }
    await this.connect(auth)

    return auth
  },
  async connect({ userId, homeserverUrl, accessToken, syncCursor }) {
    if (this.homeserver != null) {
      console.log('Already connected')
      return
    }

    console.log('homeserverUrl', homeserverUrl)
    this.homeserver = createHomeserver({ userId, homeserverUrl, accessToken })
    this.startSync(syncCursor ?? null)
    console.log('Connected to server')
  },
  startSync(initialCursor = null) {
    console.log('starting sync', initialCursor)
    const sync = async (cursor, firstSync = false) => {
      try {
        const timeout = cursor == null || firstSync ? 0 : ms('30s')
        const result = await retry({
          fn: () => this.homeserver.sync(cursor, timeout),
          onFail: (error, abort) => {
            if (error instanceof UnknownTokenError) {
              console.log('Unauthorized sync', error)
              this.pubsub.publish('error.unauthorized')
              abort(error)
            } else {
              console.log('Failed sync... Trying again', error)
            }
          },
        })
        cursor = result.cursor

        const syncData = formatSyncData(result)
        this.pubsub.publish('sync', {
          firstSync,
          data: syncData,
        })
        sync(cursor)
      } catch (error) {
        console.log('sync completely failed')
      }
    }
    sync(initialCursor, true)
  },
  sendMessage({ roomId, type, body, transactionId }) {
    return this.homeserver.sendMessage({
      roomId,
      type,
      body,
      txnId: transactionId,
    })
  },
  createPrivateRoom(...args) {
    return this.homeserver.createPrivateRoom(...args)
  },
  fetchProfile(userId) {
    return this.homeserver.fetchProfile({ userId })
  },
  updateReadMarker({ roomId, eventId }) {
    return this.homeserver.updateReadMarker({ roomId, eventId })
  },
  getMediaThumbnailUrl(url, opts) {
    return this.homeserver.getMediaThumbnailUrl(url, opts)
  },
  on(event, fn) {
    const token = this.pubsub.subscribe(event, fn)
    return () => {
      this.pubsub.unsubscribe(token)
    }
  },
  once(event, fn) {
    const token = this.pubsub.subscribe(event, (...args) => {
      unsubscribe()
      fn(...args)
    })
    const unsubscribe = () => {
      this.pubsub.unsubscribe(token)
    }
    return unsubscribe
  },
}

export default Client

export const destructUserId = userId => {
  const [_, user, homeserverUrl] = userId.match(/\@(.+?):(.+)/)
  return {
    user,
    homeserverUrl: `https://${homeserverUrl}`,
  }
}

const retry = async ({ fn, onFail, times }) => {
  const RETRY_MULTIPLIER = 2
  const MAX_DELAY = ms('30s')
  let retryDelay = ms('1s')

  return new Promise((resolve, reject) => {
    const tryFn = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        const timeout = setTimeout(tryFn, retryDelay)
        retryDelay = Math.min(retryDelay + RETRY_MULTIPLIER, MAX_DELAY)
        const abort = abortErr => {
          clearTimeout(timeout)
          reject(abortErr)
        }
        onFail(error, abort)
      }
    }
    tryFn()
  })
}
