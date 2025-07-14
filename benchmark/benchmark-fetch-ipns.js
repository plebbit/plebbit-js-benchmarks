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

import Plebbit from '../node_modules/@plebbit/plebbit-js/dist/node/index.js'

it('benchmark', async function() {
  let benchmarkOptionsName, runtime
  try {
    benchmarkOptionsName = window.benchmarkOptionsName
    runtime = 'chrome'
  }
  catch (e) {
    benchmarkOptionsName = process.argv.includes('--benchmarkOptionsName') && process.argv[process.argv.indexOf('--benchmarkOptionsName') + 1]
    runtime = 'node'
  }
  if (!benchmarkOptionsName) {
    throw Error('missing benchmarkOptionsName')
  }
  const benchmarkOptions = await fetch(`${benchmarkServerUrl}/benchmark-options?benchmarkOptionsName=${benchmarkOptionsName}&benchmarkOptionsType=${benchmarkOptionsType}`).then(res => res.json())
  if (!benchmarkOptions) {
    throw Error('failed fetching benchmarkOptions')
  }

  const plebbitOptions = {
    ...benchmarkOptions.plebbitOptions,
  }
  const plebbit = await Plebbit(plebbitOptions)
  plebbit.on('error', plebbitErrorEvent => console.log('plebbitErrorEvent:', plebbitErrorEvent.message))

  const beforeReportTimestamp = Date.now()
  const reportSubplebbits = {}

  const fetchSubplebbit = (subplebbitAddress) => new Promise(async resolve => {
    reportSubplebbits[subplebbitAddress] = {resolvingAddressTimeSeconds: null, fetchingIpnsTimeSeconds: null}
    let beforeTimestamp
    const subplebbit = await plebbit.createSubplebbit({address: subplebbitAddress})
    subplebbit.on('error', subplebbitErrorEvent => console.log('subplebbitErrorEvent:', subplebbitAddress, subplebbitErrorEvent.message))
    subplebbit.on('updatingstatechange', updatingState => {
      if (updatingState === 'resolving-address') {
        beforeTimestamp = Date.now()
      }
      if (updatingState === 'fetching-ipns') {
        if (reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`resolved address ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds}s`)
      }
      if (updatingState === 'fetching-ipfs') {
        if (reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`fetched ipns ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
      }
      if (updatingState === 'succeeded') {
        // not all plebbit options have fetching-ipfs state
        if (reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds) {
          reportSubplebbits[subplebbitAddress].fetchingIpfsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipfs ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].fetchingIpfsTimeSeconds}s`)
        }
        else {
          reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipns ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
        }
        resolve()
        subplebbit.stop().catch(() => {})
      }
      if (updatingState === 'failed') {
        console.log(`failed fetching ipns ${subplebbitAddress}`)
        resolve()
        subplebbit.stop().catch(() => {})
      }
      if (updatingState === 'waiting-retry') {
        // wait retry for 10s
        setTimeout(() => {
          console.log(`failed (waiting retry more than 10s)' fetching ipns ${subplebbitAddress}`)
          resolve()
          subplebbit.stop().catch(() => {})
        }, 10000)
      }
    })
    subplebbit.update()
  })

  const fetchSubplebbits = async () => {
    console.log('fetching subplebbits...')
    const promises = benchmarkOptions.subplebbitAddresses.map(fetchSubplebbit)
    await Promise.all(promises)
    console.log('done fetching subplebbits')
  }

  const writeReport = async () => {
    const report = {
      name: benchmarkOptions.name,
      type: benchmarkOptionsType,
      timestamp: Date.now(),
      timeSeconds: (Date.now() - beforeReportTimestamp) / 1000,
      runtime,
      subplebbits: reportSubplebbits
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

  await fetchSubplebbits()
  await writeReport()
  console.log(reportSubplebbits)
  console.log(benchmarkOptions.name, 'done')

  try {
    process.exit()
  }
  catch (e) {}
})
