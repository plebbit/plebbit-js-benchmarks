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

export default {resolveAddressesBenchmarkOptions}
