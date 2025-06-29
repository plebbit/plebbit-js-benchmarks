// debug libp2p
console.log('make sure to run with DEBUG=libp2p*,helia*,delegated*')

const benchmarkOptions = {
  name: 'libp2pJsClientsOptions',
  plebbitOptions: {
    libp2pJsClientsOptions: [{
      key: 'libp2pJsClient', 
      libp2pOptions: {
        connectionGater: {denyDialMultiaddr: (multiaddress) => String(multiaddress).includes('webrtc-direct')}
      }, 
      heliaOptions: {}
    }],
    httpRoutersOptions: [
      'https://routing.lol',
      'https://peers.pleb.bot',
      'https://peers.plebpubsub.xyz',
      'https://peers.forumindex.com'
    ],
    // httpRoutersOptions: ['http://127.0.0.1:9999'],
    chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
    resolveAuthorAddresses: false,
    validatePages: false,
    dataPath: '.plebbit-benchmark'
  },
  subplebbitAddresses: [
    // 'plebtoken.eth',
    'blog.plebbit.eth',
    // 'plebwhales.eth',
    // 'pleblore.eth',
    // 'politically-incorrect.eth',
    // 'business-and-finance.eth',
    // 'movies-tv-anime.eth',
    // 'plebmusic.eth',
    // 'videos-livestreams-podcasts.eth',
    // 'health-nutrition-science.eth',
    // 'censorship-watch.eth',
    // 'reddit-screenshots.eth',
    // 'weaponized-autism.eth',
    // 'plebpiracy.eth',
    // 'technopleb.eth',
    // 'fatpeoplehate.eth',
  ]
}

// delete plebbit-js cache (for resolving address)
import fs from 'fs'
// fs.rmSync('.plebbit-benchmark', {recursive: true, force: true})

// debug time
let seconds = 1
setInterval(() => console.log(`\n--------\n${seconds++ / 2} seconds\n--------\n`), 500).unref?.()

// start http router
import http from 'http'
// let requestCount = 0
const server = http.createServer(async (req, res) => {
  // if (requestCount++ > 1) {
  //   return
  // }
  const json = JSON.stringify({
    "Providers": [
      {
        "Schema": "peer",
        "Addrs": [
          "/dns4/194-11-226-35.k51qzi5uqu5dhlxz4gos5ph4wivip9rgsg6tywpypccb403b0st1nvzhw8as9q.libp2p.direct/tcp/4001/tls/ws/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
          // "/ip4/194.11.226.35/tcp/4001/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
        ],
        "ID": "12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
        "Protocols": ["transport-bitswap"]
      }
    ]
  })
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*'
  })
  res.end(json)
})
server.listen(9999, () => {
  console.log(`http router listening on port ${9999}`)
})

// start plebbit
import Plebbit from '../node_modules/@plebbit/plebbit-js/dist/node/index.js'
const plebbitOptions = {...benchmarkOptions.plebbitOptions,}
const plebbit = await Plebbit(plebbitOptions)
plebbit.on('error', plebbitErrorEvent => console.log('plebbitErrorEvent:', plebbitErrorEvent.message))

const reportSubplebbits = {}

const fetchSubplebbit = (subplebbitAddress) => new Promise(async resolve => {
  reportSubplebbits[subplebbitAddress] = {}
  let beforeResolvingAddressTimestamp = Date.now()
  const subplebbit = await plebbit.createSubplebbit({address: subplebbitAddress})
  subplebbit.on('error', subplebbitErrorEvent => console.log('subplebbitErrorEvent:', subplebbitAddress, subplebbitErrorEvent.message))
  subplebbit.on('updatingstatechange', updatingState => {
    if (updatingState === 'resolving-address') {
      beforeResolvingAddressTimestamp = Date.now()
    }
    if (updatingState === 'fetching-ipns') {
      if (reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds) {
        // already logged this once, might log again if waiting retry
        return
      }
      reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
      console.log(`resolved address ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds}s`)
    }
    if (updatingState === 'succeeded') {
      reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
      console.log(`fetched ipns ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
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

await fetchSubplebbits()
console.log(reportSubplebbits)
console.log(benchmarkOptions.name, 'done')
console.log('http routers', benchmarkOptions.plebbitOptions.httpRoutersOptions)

try {
  process.exit()
}
catch (e) {}
