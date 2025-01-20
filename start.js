import './lib/modify-plebbit-js.js'
import {spawn} from 'node:child_process'
import fs from 'fs-extra'
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.dirname(fileURLToPath(import.meta.url))
const reportPath = path.join(rootPath, 'report.json')
import benchmarkOptionsFile from './benchmark-options.js'
const {resolveAddressesBenchmarkOptions} = benchmarkOptionsFile

const benchmarkNode = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('npm', ['run', 'benchmark:node', '--', 'lib/' + benchmarkFile, '--benchmarkOptionsName', benchmarkOptions.name])
  benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
  benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
  benchmarkProcess.on('close', (code) => resolve())
})

const benchmarkChrome = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('npm', ['run', 'benchmark:browser', '--', '--file', benchmarkFile, '--benchmarkOptionsName', benchmarkOptions.name])
  benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
  benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
  benchmarkProcess.on('close', (code) => resolve())
})

const printReport = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('npm', ['run', 'print-report'])
  benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
  benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
  benchmarkProcess.on('close', (code) => resolve())
})

// reset report
fs.removeSync(reportPath)

console.log(resolveAddressesBenchmarkOptions)

// benchmark resolve addresses
for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
  fs.removeSync(benchmarkOptions.plebbitOptions.dataPath)
  const benchmarkFile = 'benchmark-resolve-addresses.js'
  await benchmarkNode(benchmarkFile, benchmarkOptions)
}
for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
  const benchmarkFile = 'benchmark-resolve-addresses.js'
  await benchmarkChrome(benchmarkFile, benchmarkOptions)
}

await printReport()
