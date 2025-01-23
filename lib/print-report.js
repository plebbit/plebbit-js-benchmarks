import report from '../report.json' assert {type: 'json'}

const benchmarkTypeToTimePropName = {
  resolveAddressesBenchmarkOptions: 'resolvingAddressTimeSeconds',
  fetchIpnsBenchmarkOptions: 'fetchingIpnsTimeSeconds'
}

function getAverage(data, benchmarkOptionsType) {
  const timePropName = benchmarkTypeToTimePropName[benchmarkOptionsType]
  const times = Object.values(data).map(entry => entry[timePropName]).filter(time => time !== undefined)
  const total = times.reduce((sum, time) => sum + time, 0)
  return total / times.length
}

function getMedian(data, benchmarkOptionsType) {
  const timePropName = benchmarkTypeToTimePropName[benchmarkOptionsType]
  const times = Object.values(data).map(entry => entry[timePropName]).filter(time => time !== undefined)
  const sortedTimes = [...times].sort((a, b) => a - b)
  const midIndex = Math.floor(sortedTimes.length / 2)
  if (sortedTimes.length % 2 === 0) {
    return (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2
  } else {
    return sortedTimes[midIndex]
  }
}

function getSuccessRate(data, benchmarkOptionsType) {
  const timePropName = benchmarkTypeToTimePropName[benchmarkOptionsType]
  const failed = Object.values(data).map(entry => entry[timePropName]).filter(time => time === undefined).length
  const total = Object.values(data).length
  return Math.round(failed / total * 100)
}

for (const benchmark of report) {
  console.log(`benchmark: ${benchmark.name} (${benchmark.runtime})`)
  console.log(`median: ${getMedian(benchmark.subplebbits, benchmark.type)}s`)
  console.log(`average: ${getAverage(benchmark.subplebbits, benchmark.type)}s`)
  console.log(`success rate: ${getSuccessRate(benchmark.subplebbits, benchmark.type)}%`)
}
