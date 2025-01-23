import defaultSubplebbits080125 from './multisubs/default-subplebbits-08-01-25.json' assert {type: 'json'}

const dataPath = '.plebbit-benchmark'

let resolveAddressesBenchmarkOptions = [
  {
    name: 'wss://ethrpc.xyz (possibly not cached)',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'wss://ethrpc.xyz',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ethrpc.xyz (possibly not cached)',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ethrpc.xyz',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ethrpc.xyz, viem, ethers.js',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz', 'viem', 'ethers.js'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'viem',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['viem'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'ethers.js',
    plebbitOptions: {
      chainProviders: {eth: {urls: ['ethers.js'], chainId: 1}},
      resolveAuthorAddresses: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  }
]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'ws://127.0.0.1:8000',
//     plebbitOptions: {
//       chainProviders: {eth: {urls: ['ws://127.0.0.1:8000'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'ws://212.232.23.194',
//     plebbitOptions: {
//       chainProviders: {eth: {urls: ['ws://212.232.23.194'], chainId: 1}},
//       resolveAuthorAddresses: false,
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
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

// resolveAddressesBenchmarkOptions = [
//   {
//     name: 'wss://mainnet.infura.io',
//     plebbitOptions: {
//       chainProviders: {eth: {urls: ['wss://mainnet.infura.io/ws/v3/f122e8b2aba04cf99a2e01eccd50d237'], chainId: 1}},
//       resolveAuthorAddresses: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
//   }
// ]

let fetchIpnsBenchmarkOptions = [
  {
    name: 'https://ipfsgateway.xyz (possibly not cached)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {eth: {urls: ['wss://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false,
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
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  }
]

export default {resolveAddressesBenchmarkOptions, fetchIpnsBenchmarkOptions}
