const benchmarkOptionsType = 'fetchIpnsBenchmarkOptions'
const benchmarkServerUrl = 'http://127.0.0.1:3000'

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
  }
  const plebbit = await Plebbit(plebbitOptions)
  plebbit.on('error', plebbitErrorEvent => console.log({plebbitErrorEvent}))

  const reportSubplebbits = {}

  const fetchSubplebbit = (subplebbitAddress) => new Promise(async resolve => {
    reportSubplebbits[subplebbitAddress] = {}
    let beforeResolvingAddressTimestamp
    const subplebbit = await plebbit.createSubplebbit({address: subplebbitAddress})
    subplebbit.on('error', subplebbitErrorEvent => console.log({subplebbitAddress, subplebbitErrorEvent}))
    subplebbit.on('updatingstatechange', updatingState => {
      if (updatingState === 'resolving-address') {
        beforeResolvingAddressTimestamp = Date.now()
      }
      if (updatingState === 'fetching-ipns') {
        reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
        console.log(`resolved address ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds}s`)
      }
      if (updatingState === 'succeeded') {
        reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
        console.log(`fetched ipns ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
        subplebbit.stop()
        resolve()
      }
      if (updatingState === 'failed') {
        console.log(`failed fetching ipns ${subplebbitAddress}`)
        subplebbit.stop()
        resolve()
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
