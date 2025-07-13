const benchmarkOptionsType = 'resolveAddressesBenchmarkOptions'
const benchmarkServerUrl = 'http://127.0.0.1:3000'
const failUrl = 'http://127.0.0.2'

// debug node
// import util from 'util'
// util.inspect.defaultOptions.depth = 6
// import './debug-http.js'

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
    ipfsGatewayUrls: [failUrl],
  }
  const plebbit = await Plebbit(plebbitOptions)
  plebbit.on('error', plebbitErrorEvent => console.log('plebbitErrorEvent:', plebbitErrorEvent.message))

  const reportSubplebbits = {}

  const fetchSubplebbit = (subplebbitAddress) => new Promise(async resolve => {
    reportSubplebbits[subplebbitAddress] = {resolvingAddressTimeSeconds: null}
    let beforeTimestamp
    const subplebbit = await plebbit.createSubplebbit({address: subplebbitAddress})
    subplebbit.on('error', subplebbitErrorEvent => console.log('subplebbitErrorEvent:', subplebbitAddress, subplebbitErrorEvent.message))
    subplebbit.on('updatingstatechange', updatingState => {
      if (updatingState === 'resolving-address') {
        beforeTimestamp = Date.now()
      }
      if (updatingState === 'fetching-ipns') {
        reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`resolved address ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds}s`)
        subplebbit.stop().catch(() => {})
        resolve()
      }
      if (updatingState === 'failed') {
        console.log(`failed resolving address ${subplebbitAddress}`)
        resolve()
        subplebbit.stop().catch(() => {})
      }
      if (updatingState === 'waiting-retry') {
        // wait retry for 10s
        setTimeout(() => {
          console.log(`failed (waiting retry more than 10s)' resolving address ${subplebbitAddress}`)
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
