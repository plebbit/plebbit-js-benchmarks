import report from '../report.json' assert {type: 'json'}

function getAverage(data) {
  // Extract resolvingAddressTimeSeconds values into an array
  const times = Object.values(data).map(entry => entry.resolvingAddressTimeSeconds);

  // Calculate average
  const total = times.reduce((sum, time) => sum + time, 0);
  return total / times.length;
}

function getMedian(data) {
  // Extract resolvingAddressTimeSeconds values into an array
  const times = Object.values(data).map(entry => entry.resolvingAddressTimeSeconds);

  // Calculate median
  const sortedTimes = [...times].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedTimes.length / 2);

  if (sortedTimes.length % 2 === 0) {
    return (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2;
  } else {
    return sortedTimes[midIndex];
  }
}

for (const benchmark of report) {
  console.log(`benchmark: ${benchmark.name} (${benchmark.runtime})`)
  console.log(`median: ${getMedian(benchmark.subplebbits)}s`)
  console.log(`average: ${getAverage(benchmark.subplebbits)}s`)
}
