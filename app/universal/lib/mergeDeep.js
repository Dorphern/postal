export const mergeDeep = (val1, val2) => {
  if (
    typeof val2 === 'object' &&
    !Array.isArray(val2) &&
    val2 != null &&
    val1 !== val2
  ) {
    const newObj = { ...val1 }
    Object.keys(val2).forEach(key => {
      const value = val2[key]
      if (value !== undefined) {
        newObj[key] = mergeDeep(val1?.[key], value)
      }
    })
    return newObj
  } else {
    return val2
  }
}
