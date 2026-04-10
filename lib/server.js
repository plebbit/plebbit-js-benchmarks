import fs from 'fs-extra'
import express from 'express'
import yargs from 'yargs/yargs'
const argv = yargs(process.argv).argv
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const reportPath = path.join(rootPath, 'report.json')
const multisubsPath = path.join(rootPath, 'multisubs')
const communitiesCachePath = path.join(rootPath, 'communities-cache.json')
const benchmarkOptionsPath = path.join(rootPath, 'benchmark-options.js')

const communityFailedCacheSeconds = 60 * 30 // 30min
let communitiesCache = {}
try {
  communitiesCache = JSON.parse(fs.readFileSync(communitiesCachePath, 'utf-8'))
}
catch (e) {}
import PKC from '@pkcprotocol/pkc-js'
const pkc = await PKC({
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
pkc.on('error', () => {})

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

  let reports = []
  try {
    reports = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
  }
  catch (e) {}
  reports.push(report)
  fs.writeFileSync(reportPath, JSON.stringify(reports))

  res.send()
})

app.get('/community', async (req, res) => {
  console.log('/community', req.query)
  const {communityAddress} = req.query

  let sent = false
  const send = (string) => {
    if (sent) {
      return
    }
    sent = true
    res.send(string)
  }

  if (communitiesCache[communityAddress]?.failedAt > Date.now() / 1000 - communityFailedCacheSeconds) {
    send(JSON.stringify({error: {message: `fetching community failed recently, not fetching will probably fail again: ${communitiesCache[communityAddress].error?.message}`}}))
    return
  }

  if (!communitiesCache[communityAddress]) {
    try {
      // handle potential time out
      setTimeout(() => {
        const error = {message: 'pkc.getCommunity timed out'}
        send(JSON.stringify({error}))
        communitiesCache[communityAddress] = {failedAt: Math.round(Date.now / 1000), error}
        fs.writeFileSync(communitiesCachePath, JSON.stringify(communitiesCache))
      }, 1000 * 120)

      console.log(`${communityAddress} not cached, fetching...`)
      communitiesCache[communityAddress] = JSON.parse(JSON.stringify(await pkc.getCommunity(communityAddress)))
      fs.writeFileSync(communitiesCachePath, JSON.stringify(communitiesCache))
    }
    catch (e) {
      const error = {message: e.message}
      send(JSON.stringify({error}))
      communitiesCache[communityAddress] = {failedAt: Math.round(Date.now / 1000), error}
      fs.writeFileSync(communitiesCachePath, JSON.stringify(communitiesCache))
      return
    }
  }
  send(JSON.stringify(communitiesCache[communityAddress] || null))
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
