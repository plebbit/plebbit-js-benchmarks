import {spawn} from 'node:child_process'
import fs from 'fs-extra'
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.dirname(fileURLToPath(import.meta.url))
const reportPath = path.join(rootPath, 'report.json')
const benchmarkResolveAddressesPath = path.join(rootPath, 'benchmark-resolve-addresses.js')

// subplebbits
import defaultSubplebbits080125 from './multisubs/default-subplebbits-08-01-25.json' assert {type: 'json'}

const benchmark = (benchmarkPath, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('node', [benchmarkPath, JSON.stringify(benchmarkOptions)]);
  benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
  benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
  benchmarkProcess.on('close', (code) => resolve())
})

const resolveAddressesBenchmarkOptions = [
  {
    name: 'https://ethrpc.xyz', 
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz'], chainId: 1}},
      resolveAuthorAddresses: false
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'viem', 
    plebbitOptions: {
      chainProviders: {eth: {urls: ['viem'], chainId: 1}},
      resolveAuthorAddresses: false
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'ethers.js', 
    plebbitOptions: {
      chainProviders: {eth: {urls: ['ethers.js'], chainId: 1}},
      resolveAuthorAddresses: false
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  },
  {
    name: 'https://ethrpc.xyz, viem, ethers.js', 
    plebbitOptions: {
      chainProviders: {eth: {urls: ['https://ethrpc.xyz', 'viem', 'ethers.js'], chainId: 1}},
      resolveAuthorAddresses: false
    },
    subplebbitAddresses: defaultSubplebbits080125.subplebbits.map(s => s.address).filter(s => s.endsWith('.eth'))
  }
]

// reset report
fs.removeSync(reportPath)

// benchmark resolve addresses
for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
  await benchmark(benchmarkResolveAddressesPath, benchmarkOptions)
}
