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

const subplebbitFailedCacheSeconds = 60 * 30 // 30min
let subplebbitsCache = {}
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

  let sent = false
  const send = (string) => {
    if (sent) {
      return
    }
    sent = true
    res.send(string)
  }

  if (subplebbitsCache[subplebbitAddress]?.failedAt > Date.now() / 1000 - subplebbitFailedCacheSeconds) {
    send(JSON.stringify({error: {message: `fetching subplebbit failed recently, not fetching will probably fail again: ${subplebbitsCache[subplebbitAddress].error?.message}`}}))
    return
  }

  if (!subplebbitsCache[subplebbitAddress]) {
    try {
      // handle potential time out
      setTimeout(() => {
        const error = {message: 'plebbit.getSubplebbit timed out'}
        send(JSON.stringify({error}))
        subplebbitsCache[subplebbitAddress] = {failedAt: Math.round(Date.now / 1000), error}
        fs.writeFileSync(subplebbitsCachePath, JSON.stringify(subplebbitsCache))
      }, 1000 * 120)

      console.log(`${subplebbitAddress} not cached, fetching...`)
      subplebbitsCache[subplebbitAddress] = JSON.parse(JSON.stringify(await plebbit.getSubplebbit(subplebbitAddress)))
      fs.writeFileSync(subplebbitsCachePath, JSON.stringify(subplebbitsCache))
    }
    catch (e) {
      const error = {message: e.message}
      send(JSON.stringify({error}))
      subplebbitsCache[subplebbitAddress] = {failedAt: Math.round(Date.now / 1000), error}
      fs.writeFileSync(subplebbitsCachePath, JSON.stringify(subplebbitsCache))
      return
    }
  }
  send(JSON.stringify(subplebbitsCache[subplebbitAddress] || null))
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
