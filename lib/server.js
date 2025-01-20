import fs from 'fs-extra'
import express from 'express'
import yargs from 'yargs/yargs'
const argv = yargs(process.argv).argv
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const reportPath = path.join(rootPath, 'report.json')
const multisubsPath = path.join(rootPath, 'multisubs')
const benchmarkOptionsPath = path.join(rootPath, 'benchmark-options.js')
let reports = []
try {
  reports = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
}
catch (e) {}

const apiPort = argv.apiPort || 3000
const app = express()
app.use(express.json())
app.listen(apiPort, () => {
  console.log(`api listening on port ${apiPort}`)
})

app.get('/benchmark-options', async (req, res) => {
  console.log('/benchmark-options', req.query)
  const {benchmarkOptionsType, benchmarkOptionsName} = req.query
  const {default: benchmarkOptions} = await import(benchmarkOptionsPath)
  res.send(benchmarkOptions[benchmarkOptionsType].find(benchmarkOptions => benchmarkOptions.name === benchmarkOptionsName))
})

app.post(`/report`, async (req, res) => {
  console.log('/report', req.body)
  const report = req.body
  reports.push(report)
  fs.writeFileSync(reportPath, JSON.stringify(reports))
  res.send()
})
