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
  ? 'publish' : 'community'

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
      if (reportType === 'community') {
        if (hasTimePropName(benchmark.communities, 'resolvingAddressTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'resolve address',
            median: getMedian(benchmark.communities, 'resolvingAddressTimeSeconds'),
            average: getAverage(benchmark.communities, 'resolvingAddressTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'resolvingAddressTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.communities, 'fetchingIpnsTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'fetch ipns',
            median: getMedian(benchmark.communities, 'fetchingIpnsTimeSeconds'),
            average: getAverage(benchmark.communities, 'fetchingIpnsTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'fetchingIpnsTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.communities, 'fetchingIpfsTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'fetch ipfs',
            median: getMedian(benchmark.communities, 'fetchingIpfsTimeSeconds'),
            average: getAverage(benchmark.communities, 'fetchingIpfsTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'fetchingIpfsTimeSeconds')
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
        if (hasTimePropName(benchmark.comments, 'resolvingCommunityAddressTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'resolve community address',
            median: getMedian(benchmark.comments, 'resolvingCommunityAddressTimeSeconds'),
            average: getAverage(benchmark.comments, 'resolvingCommunityAddressTimeSeconds'),
            success: getSuccessRatio(benchmark.comments, 'resolvingCommunityAddressTimeSeconds')
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
        if (hasTimePropName(benchmark.communities, 'challengeRequestTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge request',
            median: getMedian(benchmark.communities, 'challengeRequestTimeSeconds'),
            average: getAverage(benchmark.communities, 'challengeRequestTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'challengeRequestTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.communities, 'challengeTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge',
            median: getMedian(benchmark.communities, 'challengeTimeSeconds'),
            average: getAverage(benchmark.communities, 'challengeTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'challengeTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.communities, 'challengeAnswerTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge answer',
            median: getMedian(benchmark.communities, 'challengeAnswerTimeSeconds'),
            average: getAverage(benchmark.communities, 'challengeAnswerTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'challengeAnswerTimeSeconds')
          }
        }
        if (hasTimePropName(benchmark.communities, 'challengeVerificationTimeSeconds')) {
          const rowName = getNextRowName()
          table[rowName] = {
            runtime: benchmark.runtime,
            benchmark: 'challenge verification',
            median: getMedian(benchmark.communities, 'challengeVerificationTimeSeconds'),
            average: getAverage(benchmark.communities, 'challengeVerificationTimeSeconds'),
            success: getSuccessRatio(benchmark.communities, 'challengeVerificationTimeSeconds')
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
      if (reportType === 'community') {
        if (hasTimePropName(benchmark.communities, 'resolvingAddressTimeSeconds')) {
          console.log(
            "resolve address:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'resolvingAddressTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'resolvingAddressTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'resolvingAddressTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.communities, 'fetchingIpnsTimeSeconds')) {
          console.log(
            "fetch ipns:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'fetchingIpnsTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'fetchingIpnsTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'fetchingIpnsTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.communities, 'fetchCommentIpfsTimeSeconds')) {
          console.log(
            "fetch ipfs:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'fetchCommentIpfsTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'fetchCommentIpfsTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'fetchCommentIpfsTimeSeconds')}`
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
        if (hasTimePropName(benchmark.comments, 'resolvingCommunityAddressTimeSeconds')) {
          console.log(
            "community address:".padEnd(pad) +
            `median ${getMedian(benchmark.comments, 'resolvingCommunityAddressTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.comments, 'resolvingCommunityAddressTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.comments, 'resolvingCommunityAddressTimeSeconds')}`
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
        if (hasTimePropName(benchmark.communities, 'challengeRequestTimeSeconds')) {
          console.log(
            "request:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'challengeRequestTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'challengeRequestTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'challengeRequestTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.communities, 'challengeTimeSeconds')) {
          console.log(
            "challenge:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'challengeTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'challengeTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'challengeTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.communities, 'challengeAnswerTimeSeconds')) {
          console.log(
            "answer:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'challengeAnswerTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'challengeAnswerTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'challengeAnswerTimeSeconds')}`
          )
        }
        if (hasTimePropName(benchmark.communities, 'challengeVerificationTimeSeconds')) {
          console.log(
            "verification:".padEnd(pad) +
            `median ${getMedian(benchmark.communities, 'challengeVerificationTimeSeconds')}s`.padEnd(pad) +
            `| average ${getAverage(benchmark.communities, 'challengeVerificationTimeSeconds')}s`.padEnd(pad) +
            `| success ${getSuccessRatio(benchmark.communities, 'challengeVerificationTimeSeconds')}`
          )
        }
      }
    }
  }
}
