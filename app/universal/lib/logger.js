const timersStart = {}

export const time = label => {
  timersStart[label] = Date.now()
}

export const timeStep = label => {
  const end = Date.now() - timersStart[label]
  console.info(`${label} (step): ${end}ms`)
}

export const timeEnd = label => {
  const end = Date.now() - timersStart[label]
  console.info(`${label}: ${end}ms`)
  timersStart[label] = null
}

const counters = {}
export const logCount = label => {
  counters[label] = (counters[label] ?? 0) + 1
  console.log(`${label}: ${counters[label]} Time(s)`)
}
