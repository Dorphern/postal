export const findOptimum = (entries, compare) => {
  let entry = null

  entries.forEach(newEntry => {
    if (compare(newEntry, entry)) {
      entry = newEntry
    }
  })

  return entry
}
