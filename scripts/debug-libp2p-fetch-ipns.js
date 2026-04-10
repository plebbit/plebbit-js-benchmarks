// debug libp2p
console.log('make sure to run with DEBUG=libp2p*,helia*,delegated*')

const benchmarkOptions = {
  name: 'libp2pJsClientsOptions',
  pkcOptions: {
    libp2pJsClientsOptions: [{
      key: 'libp2pJsClient',
      libp2pOptions: {
        connectionGater: {
          denyDialMultiaddr: (multiaddress) => String(multiaddress).includes('webrtc-direct')
        }
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
    dataPath: '.pkc-benchmark'
  },
  communityAddresses: [
    // 'plebtoken.eth',
    // 'blog.plebbit.eth',
    // 'plebwhales.eth',
    // 'pleblore.eth',
    // 'politically-incorrect.eth',
    // 'business-and-finance.eth',
    // 'movies-tv-anime.eth',
    // 'plebmusic.eth',
    // 'videos-livestreams-podcasts.eth',
    // 'health-nutrition-science.eth',
    'censorship-watch.eth',
    // 'reddit-screenshots.eth',
    // 'weaponized-autism.eth',
    // 'plebpiracy.eth',
    // 'technopleb.eth',
    'fatpeoplehate.eth',
  ]
}

// delete pkc-js cache (for resolving address)
import fs from 'fs'
// fs.rmSync('.pkc-benchmark', {recursive: true, force: true})

// debug time and connections
if (process.env.DEBUG) {
  let seconds = 1
  setInterval(() => {
    let connected = 'connected:'
    libp2p?.getConnections().forEach(connection => {connected += `\n${connection.remoteAddr.toString()}`})
    console.log(`\n--------\n${seconds++ / 2} seconds, ${connected}\n--------\n`)
  }, 500).unref?.()
}

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
      // {
      //   "Schema": "peer",
      //   "Addrs": [
      //     "/ip4/91.234.199.189/tcp/4001/p2p/12D3KooWN67Wwh6EgudDZZr1UGbMmowxZHZLsSPWCsBy2rhL39T2",
      //   ],
      //   "ID": "12D3KooWN67Wwh6EgudDZZr1UGbMmowxZHZLsSPWCsBy2rhL39T2",
      //   "Protocols": ["transport-bitswap"]
      // }
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

// start pkc
import PKC from '../node_modules/@pkcprotocol/pkc-js/dist/node/index.js'
const pkcOptions = {...benchmarkOptions.pkcOptions,}
const pkc = await PKC(pkcOptions)
pkc.on('error', pkcErrorEvent => console.log('pkcErrorEvent:', pkcErrorEvent.message))
const libp2p = pkc.clients.libp2pJsClients.libp2pJsClient._helia.libp2p

const reportCommunities = {}

const fetchCommunity = (communityAddress) => new Promise(async resolve => {
  reportCommunities[communityAddress] = {}
  let beforeResolvingAddressTimestamp = Date.now()
  const community = await pkc.createCommunity({address: communityAddress})
  community.on('error', communityErrorEvent => console.log('communityErrorEvent:', communityAddress, communityErrorEvent.message))
  community.on('updatingstatechange', updatingState => {
    if (updatingState === 'resolving-address') {
      beforeResolvingAddressTimestamp = Date.now()
    }
    if (updatingState === 'fetching-ipns') {
      if (reportCommunities[communityAddress].resolvingAddressTimeSeconds) {
        // already logged this once, might log again if waiting retry
        return
      }
      reportCommunities[communityAddress].resolvingAddressTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
      console.log(`resolved address ${communityAddress} in ${reportCommunities[communityAddress].resolvingAddressTimeSeconds}s`)
    }
    if (updatingState === 'succeeded') {
      reportCommunities[communityAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
      console.log(`fetched ipns ${communityAddress} in ${reportCommunities[communityAddress].fetchingIpnsTimeSeconds}s`)
      resolve()
      // community.stop().catch(() => {})
    }
    if (updatingState === 'failed') {
      // console.log(`failed fetching ipns ${communityAddress}`)
      resolve()
      // community.stop().catch(() => {})
    }
    if (updatingState === 'waiting-retry') {
      // wait retry for 10s
      setTimeout(() => {
        // console.log(`failed (waiting retry more than 10s)' fetching ipns ${communityAddress}`)
        resolve()
        // community.stop().catch(() => {})
      }, 10000)
    }
  })
  community.update()
})

const fetchCommunities = async () => {
  console.log('fetching communities...')
  const promises = benchmarkOptions.communityAddresses.map(fetchCommunity)
  await Promise.all(promises)
  console.log('done fetching communities')
}

await fetchCommunities()
console.log(reportCommunities)
console.log(benchmarkOptions.name, 'done')
console.log('http routers', benchmarkOptions.pkcOptions.httpRoutersOptions)

try {
  process.exit()
}
catch (e) {}
