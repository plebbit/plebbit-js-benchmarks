import defaultSubplebbits080125 from './multisubs/default-subplebbits-08-01-25.json' with {type: 'json'}

const dataPath = '.plebbit-benchmark'

let resolveAddressesBenchmarkOptions = [
  {
    name: 'https://ethrpc.xyz (possibly not cached)',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ethrpc.xyz',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'wss://ethrpc.xyz (possibly not cached)',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'wss://ethrpc.xyz',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ethrpc.xyz, viem, ethers.js',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz', 'viem', 'ethers.js'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'viem',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['viem'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'ethers.js',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['ethers.js'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://solrpc.xyz',
    plebbitOptions: {
      chainProviders: {sol: {urls: ['https://solrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.sol'))
  },
  {
    name: 'wss://solrpc.xyz (wss not yet implemented)',
    plebbitOptions: {
      chainProviders: {sol: {urls: ['wss://solrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.sol'))
  },
  {
    name: 'web3.js',
    plebbitOptions: {
      chainProviders: {sol: {urls: ['web3.js'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.sol'))
  },
  {
    name: 'https://solrpc.xyz, web3.js',
    plebbitOptions: {
      chainProviders: {sol: {urls: ['https://solrpc.xyz', 'web3.js'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.sol'))
  }
]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'ws://127.0.0.1:8000',
//     plebbitOptions: {
//       chainProviders: {eth: {urls: ['ws://127.0.0.1:8000'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'wss://ethrpc.xyz',
//     plebbitOptions: {
//       chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'https://solrpc.xyz',
//     plebbitOptions: {
//       chainProviders: {sol: {urls: ['https://solrpc.xyz'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.sol'))
//   }
// ]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'wss://solrpc.xyz',
//     plebbitOptions: {
//       chainProviders: {sol: {urls: ['wss://solrpc.xyz'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.sol'))
//   }
// ]

let fetchIpnsBenchmarkOptions = [
  {
    name: 'https://ipfsgateway.xyz (possibly not cached)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ipfsgateway.xyz',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://gateway.plebpubsub.xyz',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://gateway.plebpubsub.xyz'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://gateway.forumindex.com',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://gateway.forumindex.com'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'libp2p js client',
    plebbitOptions: {
      libp2pJsClientsOptions: [{key: 'libp2pjs'}],
      httpRoutersOptions: [
        'https://routing.lol',
        'https://peers.pleb.bot',
        'https://peers.plebpubsub.xyz',
        'https://peers.forumindex.com'
      ],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  }
]

// fetchIpnsBenchmarkOptions = [
//   {
//     name: 'https://ipfsgateway.xyz',
//     plebbitOptions: {
//       ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
//       chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: ['business-and-finance.eth']
//   }
// ]

// fetchIpnsBenchmarkOptions = [
//   {
//     name: 'http://localhost:8000',
//     plebbitOptions: {
//       ipfsGatewayUrls: ['http://localhost:8000'],
//       chainProviders: {eth: {urls: ['http://localhost:8000'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

fetchIpnsBenchmarkOptions = [
  {
    name: 'libp2p js client',
    plebbitOptions: {
      libp2pJsClientsOptions: [{key: 'libp2pjs'}],
      httpRoutersOptions: [
        'https://routing.lol',
        'https://peers.pleb.bot',
        'https://peers.plebpubsub.xyz',
        'https://peers.forumindex.com'
      ],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  }
]

let gatewayFetchIpnsBenchmarkOptions = [
  {
    name: 'https://ipfsgateway.xyz (gateway fetch only)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://gateway.plebpubsub.xyz (gateway fetch only)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://gateway.plebpubsub.xyz'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://gateway.forumindex.com (gateway fetch only)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://gateway.forumindex.com'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  }
]

// gatewayFetchIpnsBenchmarkOptions = [
//   {
//     name: 'http://localhost:8000 (gateway fetch only)',
//     plebbitOptions: {
//       ipfsGatewayUrls: ['http://localhost:8000'],
//       chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

export default {resolveAddressesBenchmarkOptions, fetchIpnsBenchmarkOptions, gatewayFetchIpnsBenchmarkOptions}
