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
    // wss not yet implemented for sol rpc, low priority, did not improve speed in eth rpc
    name: 'wss://solrpc.xyz (wss not implemented)',
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

let fetchIpnsBenchmarkOptions = [
  {
    name: 'https://ipfsgateway.xyz (possibly not cached)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  },
  {
    name: 'https://ipfsgateway.xyz',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  },
  {
    name: 'https://gateway.plebpubsub.xyz',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://gateway.plebpubsub.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  },
  {
    name: 'https://gateway.forumindex.com',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://gateway.forumindex.com'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  },
  {
    name: 'https://ipfsgateway.xyz, https://gateway.plebpubsub.xyz, https://gateway.forumindex.com',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz', 'https://gateway.plebpubsub.xyz', 'https://gateway.forumindex.com'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
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
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  }
]

// fetchIpnsBenchmarkOptions = [
//   {
//     name: 'libp2p js client',
//     plebbitOptions: {
//       libp2pJsClientsOptions: [{key: 'libp2pjs'}],
//       httpRoutersOptions: [
//         'https://routing.lol',
//         'https://peers.pleb.bot',
//         'https://peers.plebpubsub.xyz',
//         'https://peers.forumindex.com'
//       ],
//       chainProviders: {
//         eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
//         sol: {urls: ['https://solrpc.xyz'], chainId: 1}
//       },
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
//   }
// ]

// fetchIpnsBenchmarkOptions = [
//   {
//     name: 'https://gateway.plebpubsub.xyz',
//     plebbitOptions: {
//       ipfsGatewayUrls: ['https://gateway.plebpubsub.xyz'],
//       chainProviders: {
//         eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
//         sol: {urls: ['https://solrpc.xyz'], chainId: 1}
//       },
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
//   },
// ]

// only fetches the first gateway
let gatewayFetchIpnsBenchmarkOptions = [
  {
    name: 'https://ipfsgateway.xyz (gateway fetch only)',
    plebbitOptions: {ipfsGatewayUrls: ['https://ipfsgateway.xyz']},
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  },
  {
    name: 'https://gateway.plebpubsub.xyz (gateway fetch only)',
    plebbitOptions: {ipfsGatewayUrls: ['https://gateway.plebpubsub.xyz']},
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  },
  {
    name: 'https://gateway.forumindex.com (gateway fetch only)',
    plebbitOptions: {ipfsGatewayUrls: ['https://gateway.forumindex.com']},
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address)
  }
]

// TODO, post, reply, 10 posts/replies from different subs, 10 posts/replies from the same sub
const postCid = 'QmQ5iZNEiiitJmefk1zRqYxa7fAuQo4vy3XAUy3UpUMhwG'
const replyCid = 'QmWtN7Uue8Pw3Gg1V7csVjnsswpdJQbW3aHNk2gRfjPjig'
const oneSub5Posts5Replies = [
  // posts
  'QmWuSQNZszHSPtwLmr41mS1drMnzCKfp7GLQUmdVg5aoZ1',
  'QmXdSw2ydiKLnMjxyEHQye7ZUa5cHQKmKiSMF9yRfMLkrs',
  'QmQ5iZNEiiitJmefk1zRqYxa7fAuQo4vy3XAUy3UpUMhwG',
  'Qmaq3DgXQEdfGhusKtJCTZU3HyXrPg8TKGuQLcQrgvCgps',
  'QmagGzGvUQDy7K1Kgc3d1H8YU8n9dYViaExZHWfFy6Krma',
  // replies
  'QmVwcGCHrviS44YBakEuBuNn8xCvgv1Z3TQswqRraq3APg',
  'QmcPc94WwdtF2xzFojDvanQp7V3S4FChNrG1vXwbxamcp3',
  'QmfRNP1TC9B1R1AgoW4ts86ZsWuPNrhShedxJ3axzHQ3h9',
  'QmbAwAApoVfmRmxmSdHuMA9uDVL8pd13LGM1TTU4hSXDUX',
  'QmZPfobp6UcroLtPiiAFgsAQX8RQh3WwfiCbzyHi22rBRR'
]
const tenSubs5Posts5Replies = [
  // posts
  'QmYZiS4uDR6S2vC65fmpktjH3mBn27gk3c4HkFEpf3SN61',
  'QmcYV2yoSkXazG9puqHPbApfVg6FfmrHp3tSCyNz9CBLci',
  'QmQ5iZNEiiitJmefk1zRqYxa7fAuQo4vy3XAUy3UpUMhwG',
  'QmcGmhdCV9DnXWFnD4y6wgzhXUfexJLzgz8boG97HNL4tH',
  'QmTLcPYzXiPZV6jwTF6CVUvUyLjMG4y15HRW3dA7z5rc7e',
  // replies
  'QmbmhVWWw2fWZ1EgeUK7Q4bMGa7ngpSGdgJmCWfSLJsthC',
  'QmNoNxFkEgM65ATGsL38cufuuNJx5UdNawmMAudkdwjhf1',
  'QmaaGTw5WzTFz4SMc4C4CdK7FDtaAT9yFUYekHErELXdgi',
  'QmPfjpbDqo9kEWe5gBpL9BeYUPU5GBVp17W763zyuz8JMi',
  'QmUTCSKiiTunWECvLRiJfxotUmNfanJyjRR8Tjq5pr1YLK'
]
let fetchCommentBenchmarkOptions = [
  {
    name: 'ipfsgateway.xyz (1 post)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: [postCid]
  },
  {
    name: 'ipfsgateway.xyz (1 reply)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: [replyCid]
  },
  {
    name: 'ipfsgateway.xyz (1 sub, 5 posts, 5 replies)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: oneSub5Posts5Replies
  },
  {
    name: 'ipfsgateway.xyz (10 subs, 5 posts, 5 replies)',
    plebbitOptions: {
      ipfsGatewayUrls: ['https://ipfsgateway.xyz'],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: tenSubs5Posts5Replies
  },
  {
    name: 'libp2p js client (1 post)',
    plebbitOptions: {
      libp2pJsClientsOptions: [{key: 'libp2pjs'}],
      httpRoutersOptions: [
        'https://routing.lol',
        'https://peers.pleb.bot',
        'https://peers.plebpubsub.xyz',
        'https://peers.forumindex.com'
      ],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: [postCid]
  },
  {
    name: 'libp2p js client (1 reply)',
    plebbitOptions: {
      libp2pJsClientsOptions: [{key: 'libp2pjs'}],
      httpRoutersOptions: [
        'https://routing.lol',
        'https://peers.pleb.bot',
        'https://peers.plebpubsub.xyz',
        'https://peers.forumindex.com'
      ],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: [replyCid]
  },
  {
    name: 'libp2p js client (1 sub, 5 posts, 5 replies)',
    plebbitOptions: {
      libp2pJsClientsOptions: [{key: 'libp2pjs'}],
      httpRoutersOptions: [
        'https://routing.lol',
        'https://peers.pleb.bot',
        'https://peers.plebpubsub.xyz',
        'https://peers.forumindex.com'
      ],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: oneSub5Posts5Replies
  },
  {
    name: 'libp2p js client (10 subs, 5 posts, 5 replies)',
    plebbitOptions: {
      libp2pJsClientsOptions: [{key: 'libp2pjs'}],
      httpRoutersOptions: [
        'https://routing.lol',
        'https://peers.pleb.bot',
        'https://peers.plebpubsub.xyz',
        'https://peers.forumindex.com'
      ],
      chainProviders: {
        eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
        sol: {urls: ['https://solrpc.xyz'], chainId: 1}
      },
      resolveAuthorAddresses: false,
      validatePages: false,
      dataPath
    },
    commentCids: tenSubs5Posts5Replies
  }
]

// fetchCommentBenchmarkOptions = [
//   {
//     name: 'libp2p js client (1 reply)',
//     plebbitOptions: {
//       libp2pJsClientsOptions: [{key: 'libp2pjs'}],
//       httpRoutersOptions: [
//         'https://routing.lol',
//         'https://peers.pleb.bot',
//         'https://peers.plebpubsub.xyz',
//         'https://peers.forumindex.com'
//       ],
//       chainProviders: {
//         eth: {urls: ['https://ethrpc.xyz'], chainId: 1}, 
//         sol: {urls: ['https://solrpc.xyz'], chainId: 1}
//       },
//       resolveAuthorAddresses: false,
//       validatePages: false,
//       dataPath
//     },
//     commentCids: [replyCid]
//   }
// ]

export default {resolveAddressesBenchmarkOptions, fetchIpnsBenchmarkOptions, gatewayFetchIpnsBenchmarkOptions, fetchCommentBenchmarkOptions}
