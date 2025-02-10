import fs from 'fs-extra'
import express from 'express'
import yargs from 'yargs/yargs'
const argv = yargs(process.argv).argv
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const reportPath = path.join(rootPath, 'report.json')
const multisubsPath = path.join(rootPath, 'multisubs')
const subplebbitsCachePath = path.join(rootPath, 'subplebbits-cache.json')
const benchmarkOptionsPath = path.join(rootPath, 'benchmark-options.js')
let reports = []
try {
  reports = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
}
catch (e) {}

let subplebbitsCache = {}, subplebbitsFailedCache = {}
try {
  subplebbitsCache = JSON.parse(fs.readFileSync(subplebbitsCachePath, 'utf-8'))
}
catch (e) {}
import Plebbit from '@plebbit/plebbit-js'
const plebbit = await Plebbit({
  ipfsGatewayUrls: [
    'https://ipfsgateway.xyz',
    'https://gateway.plebpubsub.xyz',
    'https://gateway.forumindex.com'
  ],
  chainProviders: {
    eth: {urls: ['https://ethrpc.xyz', 'viem', 'ethers.js'], chainId: 1},
    sol: {urls: ['https://solrpc.xyz', 'web3.js'], chainId: 1}
  },
  resolveAuthorAddresses: false
})
plebbit.on('error', () => {})

const apiPort = argv.apiPort || 3000
const app = express()
app.use(express.json())

app.get('/benchmark-options', async (req, res) => {
  console.log('/benchmark-options', req.query)
  const {benchmarkOptionsType, benchmarkOptionsName} = req.query
  const {default: benchmarkOptions} = await import(benchmarkOptionsPath)
  // send 'null' so that it can be json parsed as undefined
  res.send(benchmarkOptions[benchmarkOptionsType].find(benchmarkOptions => benchmarkOptions.name === benchmarkOptionsName) || 'null')
})

app.post(`/report`, async (req, res) => {
  console.log('/report', req.body)
  const report = req.body
  reports.push(report)
  fs.writeFileSync(reportPath, JSON.stringify(reports))
  res.send()
})

app.get('/subplebbit', async (req, res) => {
  console.log('/subplebbit', req.query)
  const {subplebbitAddress} = req.query
  if (subplebbitsFailedCache[subplebbitAddress]) {
    res.send(JSON.stringify({error: {message: 'fetching subplebbit failed recently, not fetching will probably fail again'}}))
    return
  }

  let sent = false
  if (!subplebbitsCache[subplebbitAddress]) {
    try {
      console.log(`${subplebbitAddress} not cached, fetching...`)
      setTimeout(() => {
        if (!sent) {
          res.send(JSON.stringify({error: {message: 'plebbit.getSubplebbit timed out'}}))
          sent = true
          subplebbitsFailedCache[subplebbitAddress] = true
        }
      }, 1000 * 120)
      subplebbitsCache[subplebbitAddress] = JSON.parse(JSON.stringify(await plebbit.getSubplebbit(subplebbitAddress)))
      fs.writeFileSync(subplebbitsCachePath, JSON.stringify(subplebbitsCache))
    }
    catch (e) {
      res.send(JSON.stringify({error: {message: e.message}}))
      sent = true
      subplebbitsFailedCache[subplebbitAddress] = true
      return
    }
  }
  res.send(JSON.stringify(subplebbitsCache[subplebbitAddress] || null))
  sent = true
})

const listen = () => new Promise((resolve, reject) => {
  try {
    const server = app.listen(apiPort, () => {
      console.log(`api listening on port ${apiPort}`)
      resolve(server)
    })
  }
  catch (e) {
    reject(e)
  }
})

export default listen
