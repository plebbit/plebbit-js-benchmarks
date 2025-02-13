const benchmarkOptionsType = 'gatewayFetchIpnsBenchmarkOptions'
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

import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {toString as uint8ArrayToString} from 'uint8arrays/to-string'
import {create as createMultihash} from 'multiformats/hashes/digest'
const protobufPublicKeyPrefix = new Uint8Array([8, 1, 18, 32])
const multihashIdentityCode = 0
export const getPlebbitAddressFromPublicKey = (publicKeyBase64) => {
  const publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64')
  const publicKeyBufferWithPrefix = new Uint8Array(protobufPublicKeyPrefix.length + publicKeyBuffer.length)
  publicKeyBufferWithPrefix.set(protobufPublicKeyPrefix, 0)
  publicKeyBufferWithPrefix.set(publicKeyBuffer, protobufPublicKeyPrefix.length)
  const multihash = createMultihash(multihashIdentityCode, publicKeyBufferWithPrefix).bytes
  return uint8ArrayToString(multihash, 'base58btc')
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1000 * 120)
  try {
    const response = await fetch(url, {
      ...options, 
      signal: controller.signal, 
      cache: 'no-cache' // test that the provider should cache even when using no-cache
    })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

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
  const gatewayUrl = plebbitOptions.ipfsGatewayUrls?.[0]
  if (!gatewayUrl) {
    throw Error(`no plebbitOptions.ipfsGatewayUrls`)
  }

  const reportSubplebbits = {}

  const fetchSubplebbit = async (subplebbitAddress) => {
    reportSubplebbits[subplebbitAddress] = {}
    let subplebbit, error
    try {
      subplebbit = await fetch(`${benchmarkServerUrl}/subplebbit?subplebbitAddress=${subplebbitAddress}`).then(res => res.json())
    }
    catch (e) {
      error = e
    }
    if (!subplebbit || subplebbit.error) {
      console.log(`failed fetching ${subplebbitAddress} from benchmark server with error: ${error?.message || subplebbit?.error?.message}`)
      return
    }

    const ipnsName = getPlebbitAddressFromPublicKey(subplebbit.signature.publicKey)
    const before = Date.now()
    try {
      const subplebbitUpdate = await fetchWithTimeout(`${gatewayUrl}/ipns/${ipnsName}`).then(res => res.json())
      if (subplebbitUpdate.signature) {
        reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - before) / 1000
        console.log(`gateway fetched ipns ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
      }
    }
    catch (e) {
      console.log(`failed gateway fetched ipns ${subplebbitAddress}: ${e.message}`)
    }
  }

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
