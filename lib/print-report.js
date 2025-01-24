import report from '../report.json' assert {type: 'json'}

const benchmarkTypeToTimePropName = {
  resolveAddressesBenchmarkOptions: 'resolvingAddressTimeSeconds',
  fetchIpnsBenchmarkOptions: 'fetchingIpnsTimeSeconds'
}

const getAverage = (data, timePropName) => {
  const times = Object.values(data).map(entry => entry[timePropName]).filter(time => time !== undefined)
  const total = times.reduce((sum, time) => sum + time, 0)
  return Number((total / times.length).toFixed(3))
}

const getMedian = (data, timePropName) => {
  const times = Object.values(data).map(entry => entry[timePropName]).filter(time => time !== undefined)
  const sortedTimes = [...times].sort((a, b) => a - b)
  const midIndex = Math.floor(sortedTimes.length / 2)
  let result
  if (sortedTimes.length % 2 === 0) {
    result =  (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2
  } else {
    result = sortedTimes[midIndex]
  }
  return Number(result.toFixed(3))
}

const getSuccessRate = (data, timePropName) => {
  const all = Object.values(data).map(entry => entry[timePropName])
  if (all.length === 0) {
    return 0
  }
  const failed = all.filter(time => time === undefined)
  return 100 - Math.round(failed.length / all.length * 100)
}

const hasTimePropName = (data, timePropName) => {
  const all = Object.values(data).map(entry => entry[timePropName])
  // probably a bug, so should be displayed
  if (all.length === 0) {
    return true
  }
  const failed = all.filter(time => time === undefined)
  if (all.length === failed.length) {
    return false
  }
  return true
}

for (const benchmark of report) {
  console.log('')
  console.log(`benchmark: ${benchmark.name} (${benchmark.runtime})`)
    console.log(`resolve address:\tmedian ${getMedian(benchmark.subplebbits, 'resolvingAddressTimeSeconds')}s\t| average ${getAverage(benchmark.subplebbits, 'resolvingAddressTimeSeconds')}s\t| success ${getSuccessRate(benchmark.subplebbits, 'resolvingAddressTimeSeconds')}%`)
  if (hasTimePropName(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')) {
    console.log(`fetch ipns     :\tmedian ${getMedian(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')}s\t| average ${getAverage(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')}s\t| success ${getSuccessRate(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')}%`)
  }
}
