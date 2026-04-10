import { test } from 'vitest'

const benchmarkOptionsType = 'fetchIpnsBenchmarkOptions'
const benchmarkServerUrl = 'http://127.0.0.1:3000'

// debug node
// import util from 'util'
// util.inspect.defaultOptions.depth = 6
// import '../lib/debug-http.js'

// fix unknown bug with viem in browser, that starts a new websocket connection per request
try {
  const OriginalWebSocket = window.WebSocket
  window.WebSocket = function (url, protocols) {
    return new OriginalWebSocket(url, protocols)
  }
} catch (e) {}

import PKC from '../node_modules/@pkcprotocol/pkc-js/dist/node/index.js'

test('benchmark', async () => {
  let benchmarkOptionsName, runtime
  try {
    benchmarkOptionsName = window.benchmarkOptionsName
    runtime = 'chrome'
  }
  catch (e) {
    benchmarkOptionsName = process.env.BENCHMARK_OPTIONS_NAME || (process.argv.includes('--benchmarkOptionsName') && process.argv[process.argv.indexOf('--benchmarkOptionsName') + 1])
    runtime = 'node'
  }
  if (!benchmarkOptionsName) {
    throw Error('missing benchmarkOptionsName')
  }
  const benchmarkOptions = await fetch(`${benchmarkServerUrl}/benchmark-options?benchmarkOptionsName=${benchmarkOptionsName}&benchmarkOptionsType=${benchmarkOptionsType}`).then(res => res.json())
  if (!benchmarkOptions) {
    throw Error('failed fetching benchmarkOptions')
  }

  const pkcOptions = {
    ...benchmarkOptions.pkcOptions,
  }
  const pkc = await PKC(pkcOptions)
  pkc.on('error', pkcErrorEvent => console.log('pkcErrorEvent:', pkcErrorEvent.message))

  const beforeReportTimestamp = Date.now()
  const reportCommunities = {}

  const fetchCommunity = (communityAddress) => new Promise(async resolve => {
    reportCommunities[communityAddress] = {resolvingAddressTimeSeconds: null, fetchingIpnsTimeSeconds: null}
    let beforeTimestamp
    const community = await pkc.createCommunity({address: communityAddress})
    community.on('error', communityErrorEvent => console.log('communityErrorEvent:', communityAddress, communityErrorEvent.message))
    community.on('updatingstatechange', updatingState => {
      if (updatingState === 'resolving-address') {
        beforeTimestamp = Date.now()
      }
      if (updatingState === 'fetching-ipns') {
        if (reportCommunities[communityAddress].resolvingAddressTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportCommunities[communityAddress].resolvingAddressTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`resolved address ${communityAddress} in ${reportCommunities[communityAddress].resolvingAddressTimeSeconds}s`)
      }
      if (updatingState === 'fetching-ipfs') {
        if (reportCommunities[communityAddress].fetchingIpnsTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportCommunities[communityAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`fetched ipns ${communityAddress} in ${reportCommunities[communityAddress].fetchingIpnsTimeSeconds}s`)
      }
      if (updatingState === 'succeeded') {
        // not all pkc options have fetching-ipfs state
        if (reportCommunities[communityAddress].fetchingIpnsTimeSeconds) {
          reportCommunities[communityAddress].fetchingIpfsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipfs ${communityAddress} in ${reportCommunities[communityAddress].fetchingIpfsTimeSeconds}s`)
        }
        else {
          reportCommunities[communityAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipns ${communityAddress} in ${reportCommunities[communityAddress].fetchingIpnsTimeSeconds}s`)
        }
        resolve()
        community.stop().catch(() => {})
      }
      if (updatingState === 'failed') {
        console.log(`failed fetching ipns ${communityAddress}`)
        resolve()
        community.stop().catch(() => {})
      }
      if (updatingState === 'waiting-retry') {
        // wait retry for 10s
        setTimeout(() => {
          console.log(`failed (waiting retry more than 10s)' fetching ipns ${communityAddress}`)
          resolve()
          community.stop().catch(() => {})
        }, 10000)
      }
    })
    community.update()

    // in case pkc-js doesn't time out fast enough
    setTimeout(() => {
      console.log(`failed fetching ipns timed out 2min ${communityAddress}`)
      resolve()
      community.stop().catch(() => {})
    }, 1000 * 60 * 2)
  })

  const fetchCommunities = async () => {
    console.log('fetching communities...')
    const promises = benchmarkOptions.communityAddresses.map(fetchCommunity)
    await Promise.all(promises)
    console.log('done fetching communities')
  }

  const writeReport = async () => {
    const report = {
      name: benchmarkOptions.name,
      type: benchmarkOptionsType,
      timestamp: Date.now(),
      timeSeconds: (Date.now() - beforeReportTimestamp) / 1000,
      runtime,
      communities: reportCommunities
    }
    const res = await fetch(`${benchmarkServerUrl}/report`, {
      method: 'POST',
      body: JSON.stringify(report),
      headers: {'Content-Type': 'application/json'}
    })
    if (res.status !== 200) {
      throw Error('failed writing report')
    }
  }

  await fetchCommunities()
  await writeReport()
  console.log(reportCommunities)
  console.log(benchmarkOptions.name, 'done')

  try {
    process.exit()
  }
  catch (e) {}
})
