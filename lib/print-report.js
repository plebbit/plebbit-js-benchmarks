import report from '../report.json' with {type: 'json'}

let format = 'table'
if (process.argv.includes('--inline')) {
  format = 'inline'
}

const getAverage = (data = {}, timePropName) => {
  const times = Object.values(data).map(entry => entry[timePropName]).filter(time => time !== undefined && time !== null)
  const total = times.reduce((sum, time) => sum + time, 0)
  return Number((total / times.length).toFixed(3))
}

const getMedian = (data = {}, timePropName) => {
  const times = Object.values(data).map(entry => entry[timePropName]).filter(time => time !== undefined && time !== null)
  const sortedTimes = [...times].sort((a, b) => a - b)
  const midIndex = Math.floor(sortedTimes.length / 2)
  let result
  if (sortedTimes.length % 2 === 0) {
    result = (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2
  } else {
    result = sortedTimes[midIndex]
  }
  return Number(result.toFixed(3))
}

const getSuccessRatio = (data = {}, timePropName) => {
  const all = Object.values(data).map(entry => entry[timePropName])
  const failed = all.filter(time => time === undefined || time === null)
  return `${all.length - failed.length}/${all.length}`
}

const hasTimePropName = (data = {}, timePropName) => {
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

const incrementString = (string) => /\s\d+$/.test(string)
    ? string.replace(/(\d+)$/, (match) => `${+match + 1}`)
    : `${string} 2`

const toArrayGroupedByPrefix = (obj) => {
  const entries = Object.entries(obj)
  const grouped = new Map()
  for (const [key, value] of entries) {
    const prefix = key.replace(/-[^-]+$/, '')
    if (!grouped.has(prefix)) grouped.set(prefix, [])
    grouped.get(prefix).push(value)
  }
  return Array.from(grouped.values()).flat()
}

// group by benchmark types
const benchmarkTypes = {}
for (const benchmark of report) {
  if (!benchmarkTypes[benchmark.type]) {
    benchmarkTypes[benchmark.type] = {}
  }
  // handle duplicate benchmark names and add runtime
  while (benchmarkTypes[benchmark.type][`${benchmark.name}-${benchmark.runtime}`]) {
    benchmark.name = incrementString(benchmark.name)
  }
  benchmarkTypes[benchmark.type][`${benchmark.name}-${benchmark.runtime}`] = benchmark
}

// group runtimes together
for (const benchmarkType in benchmarkTypes) {
  benchmarkTypes[benchmarkType] = toArrayGroupedByPrefix(benchmarkTypes[benchmarkType])
}

const formatBenchmarkTypeTitle = (string) => string.replace('BenchmarkOptions', '').replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()

const benchmarkTypeToReportType = (benchmarkType) => benchmarkType.match(/comment/i)
  ? 'comment' : benchmarkType.match(/publish/i)
  ? 'publish' : 'subplebbit'

if (format === 'table') {
  for (const benchmarkType in benchmarkTypes) {
    const table = {}
    const getNextRowName = () => ' '.repeat(Object.keys(table).length)
    const tableName = formatBenchmarkTypeTitle(benchmarkType)
    table[tableName] = {}
    table[getNextRowName()] = {}
    table[getNextRowName()] = {}

    for (const benchmark of benchmarkTypes[benchmarkType]) {
      const tableName = `${benchmark.name}`
      table[tableName] = {}

      const reportType = benchmarkTypeToReportType(benchmark.type)
      if (reportType === 'subplebbit') {
        if (hasTimePropName(benchmark.subplebbits, 'resolvingAddressTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'resolve address',
            median: getMedian(benchmark.subplebbits, 'resolvingAddressTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'resolvingAddressTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'resolvingAddressTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'fetch ipns',
            median: getMedian(benchmark.subplebbits, 'fetchingIpnsTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'fetchingIpnsTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.subplebbits, 'fetchingIpfsTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'fetch ipfs',
            median: getMedian(benchmark.subplebbits, 'fetchingIpfsTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'fetchingIpfsTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'fetchingIpfsTimeSeconds')
          }
        }
      }
      if (reportType === 'comment') {
        if (hasTimePropName(benchmark.comments, 'fetchCommentIpfsTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'fetch comment ipfs',
            median: getMedian(benchmark.comments, 'fetchCommentIpfsTimeSeconds'),
            average: getAverage(benchmark.comments, 'fetchCommentIpfsTimeSeconds'),
            success: getSuccessRatio(benchmark.comments, 'fetchCommentIpfsTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'resolve subplebbit address',
            median: getMedian(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds'),
            average: getAverage(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds'),
            success: getSuccessRatio(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.comments, 'fetchingCommentUpdateTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'fetch comment update',
            median: getMedian(benchmark.comments, 'fetchingCommentUpdateTimeSeconds'),
            average: getAverage(benchmark.comments, 'fetchingCommentUpdateTimeSeconds'),
            success: getSuccessRatio(benchmark.comments, 'fetchingCommentUpdateTimeSeconds')
          }
        }
      }
      if (reportType === 'publish') {
        if (hasTimePropName(benchmark.subplebbits, 'challengeRequestTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge request',
            median: getMedian(benchmark.subplebbits, 'challengeRequestTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'challengeRequestTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'challengeRequestTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.subplebbits, 'challengeTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge',
            median: getMedian(benchmark.subplebbits, 'challengeTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'challengeTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'challengeTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.subplebbits, 'challengeAnswerTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge answer',
            median: getMedian(benchmark.subplebbits, 'challengeAnswerTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'challengeAnswerTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'challengeAnswerTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.subplebbits, 'challengeVerificationTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge verification',
            median: getMedian(benchmark.subplebbits, 'challengeVerificationTimeSeconds'),
            average: getAverage(benchmark.subplebbits, 'challengeVerificationTimeSeconds'),
            success: getSuccessRatio(benchmark.subplebbits, 'challengeVerificationTimeSeconds')
          }
        }
      }
    }
    console.table(table)
  }
}

if (format === 'inline') {
  const pad = 18

  for (const benchmarkType in benchmarkTypes) {
    console.log('')
    console.log(`${formatBenchmarkTypeTitle(benchmarkType)}`)
    for (const benchmark of benchmarkTypes[benchmarkType]) {
      console.log('')
      console.log(`benchmark: ${benchmark.name} (${benchmark.runtime})`)

      const reportType = benchmarkTypeToReportType(benchmark.type)
      if (reportType === 'subplebbit') {
        if (hasTimePropName(benchmark.subplebbits, 'resolvingAddressTimeSeconds')) {
          console.log(
            "resolve address:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'resolvingAddressTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'resolvingAddressTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'resolvingAddressTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')) {
          console.log(
            "fetch ipns:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'fetchingIpnsTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.subplebbits, 'fetchCommentIpfsTimeSeconds')) {
          console.log(
            "fetch ipfs:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'fetchCommentIpfsTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'fetchCommentIpfsTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'fetchCommentIpfsTimeSeconds')}`
          )
        }
      }
      if (reportType === 'comment') {
        if (hasTimePropName(benchmark.comments, 'fetchCommentIpfsTimeSeconds')) {
          console.log(
            "comment ipfs:".padEnd(pad) +
            `median ${getMedian(benchmark.comments, 'fetchCommentIpfsTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.comments, 'fetchCommentIpfsTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.comments, 'fetchCommentIpfsTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds')) {
          console.log(
            "sub address:".padEnd(pad) +
            `median ${getMedian(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.comments, 'resolvingSubplebbitAddressTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.comments, 'fetchingCommentUpdateTimeSeconds')) {
          console.log(
            "comment update:".padEnd(pad) +
            `median ${getMedian(benchmark.comments, 'fetchingCommentUpdateTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.comments, 'fetchingCommentUpdateTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.comments, 'fetchingCommentUpdateTimeSeconds')}`
          )
        }
      }
      if (reportType === 'publish') {
        if (hasTimePropName(benchmark.subplebbits, 'challengeRequestTimeSeconds')) {
          console.log(
            "request:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'challengeRequestTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'challengeRequestTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'challengeRequestTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.subplebbits, 'challengeTimeSeconds')) {
          console.log(
            "challenge:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'challengeTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'challengeTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'challengeTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.subplebbits, 'challengeAnswerTimeSeconds')) {
          console.log(
            "answer:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'challengeAnswerTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'challengeAnswerTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'challengeAnswerTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.subplebbits, 'challengeVerificationTimeSeconds')) {
          console.log(
            "verification:".padEnd(pad) +
            `median ${getMedian(benchmark.subplebbits, 'challengeVerificationTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.subplebbits, 'challengeVerificationTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.subplebbits, 'challengeVerificationTimeSeconds')}`
          )
        }
      }
    }
  }
}
