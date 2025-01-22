import './lib/modify-plebbit-js.js'
import {spawn} from 'node:child_process'
import fs from 'fs-extra'
import {fileURLToPath} from 'url'
import path from 'path'
import yargs from 'yargs/yargs'
import {hideBin} from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv
console.log({argv})
const rootPath = path.dirname(fileURLToPath(import.meta.url))
const reportPath = path.join(rootPath, 'report.json')
import benchmarkOptionsFile from './benchmark-options.js'
const {resolveAddressesBenchmarkOptions} = benchmarkOptionsFile

const benchmarkNode = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('npm', ['run', 'benchmark:node', '--', 'benchmark/' + benchmarkFile, '--benchmarkOptionsName', benchmarkOptions.name])
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

const isOnly = (name) => argv.only === name || (argv.only?.length || 0) < 1 || argv.only.includes(name)

// benchmark resolve addresses
if (isOnly('resolve-addresses')) {
  if (isOnly('node')) {
    for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
      fs.removeSync(benchmarkOptions.plebbitOptions.dataPath)
      const benchmarkFile = 'benchmark-resolve-addresses.js'
      await benchmarkNode(benchmarkFile, benchmarkOptions)
    }
  }
  if (isOnly('chrome')) {
    for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
      const benchmarkFile = 'benchmark-resolve-addresses.js'
      await benchmarkChrome(benchmarkFile, benchmarkOptions)
    }
  }
}

// benchmark fetch ipns
if (isOnly('fetch-ipns')) {
  if (isOnly('node')) {
    for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
      fs.removeSync(benchmarkOptions.plebbitOptions.dataPath)
      const benchmarkFile = 'benchmark-fetch-ipns.js'
      await benchmarkNode(benchmarkFile, benchmarkOptions)
    }
  }
  if (isOnly('chrome')) {
    for (const benchmarkOptions of resolveAddressesBenchmarkOptions) {
      const benchmarkFile = 'benchmark-fetch-ipns.js'
      await benchmarkChrome(benchmarkFile, benchmarkOptions)
    }
  }
}

await printReport()
