// import './lib/modify-plebbit-js.js'
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

// reset report before starting server
fs.removeSync(reportPath)

// benchmark server is needed to send data to/from browser
import startServer from './lib/server.js'
const server = await startServer()

let benchmarkNode = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('npm', ['run', 'benchmark:node', '--', 'benchmark/' + benchmarkFile, '--benchmarkOptionsName', benchmarkOptions.name])
  benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
  benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
  benchmarkProcess.on('close', (code) => resolve())
})

// very hacky but can be used to manually debug plebbit-js
if (argv.debugPlebbitJs) {
  let seconds = 0
  setInterval(() => {console.log(`\n\n${seconds++}s\n\n`)}, 1000)
  benchmarkNode = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
    seconds = 0
    const benchmarkProcess = spawn('npm', ['run', 'benchmark:node', '--', 'benchmark/' + benchmarkFile, '--benchmarkOptionsName', benchmarkOptions.name], {
      env: {...process.env, DEBUG: 'plebbit*', FORCE_COLOR: '1'}, stdio: 'inherit'
    })
    benchmarkProcess.on('close', (code) => resolve())
  })
}

const benchmarkChrome = (benchmarkFile, benchmarkOptions) => new Promise(resolve => {
  const benchmarkProcess = spawn('npm', ['run', 'benchmark:browser', '--', '--file', benchmarkFile, '--benchmarkOptionsName', benchmarkOptions.name])
  benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
  benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
  benchmarkProcess.on('close', (code) => resolve())
})

const printReport = (benchmarkFile, benchmarkOptions) => {
  if (!fs.existsSync(reportPath)) {
    console.log(`can't print report, no file '${reportPath}'`)
    return
  }
  return new Promise(resolve => {
    const benchmarkProcess = spawn('npm', ['run', 'report'])
    benchmarkProcess.stdout.on('data', (data) => process.stdout.write(`${data}`))
    benchmarkProcess.stderr.on('data', (data) => process.stderr.write(`${data}`))
    benchmarkProcess.on('close', (code) => resolve())
  })
}

const isRuntime = (name) => argv.runtime === name || (argv.runtime?.length || 0) < 1 || argv.runtime.find?.(name)
const isBenchmark = (name) => argv.benchmark === name || (argv.benchmark?.length || 0) < 1 || argv.benchmark.find?.(name)

// benchmark resolve addresses
if (isBenchmark('resolve-addresses')) {
  console.log('benchmarking resolve-addresses...')
  const benchmarkFile = 'benchmark-resolve-addresses.js'
  if (isRuntime('node')) {
    for (const benchmarkOptions of benchmarkOptionsFile.resolveAddressesBenchmarkOptions) {
      fs.removeSync(benchmarkOptions.plebbitOptions.dataPath)
      await benchmarkNode(benchmarkFile, benchmarkOptions)
    }
  }
  if (isRuntime('chrome')) {
    for (const benchmarkOptions of benchmarkOptionsFile.resolveAddressesBenchmarkOptions) {
      await benchmarkChrome(benchmarkFile, benchmarkOptions)
    }
  }
}

// benchmark fetch ipns
if (isBenchmark('fetch-ipns')) {
  console.log('benchmarking fetch-ipns...')
  const benchmarkFile = 'benchmark-fetch-ipns.js'
  if (isRuntime('node')) {
    for (const benchmarkOptions of benchmarkOptionsFile.fetchIpnsBenchmarkOptions) {
      fs.removeSync(benchmarkOptions.plebbitOptions.dataPath)
      await benchmarkNode(benchmarkFile, benchmarkOptions)
    }
  }
  if (isRuntime('chrome')) {
    for (const benchmarkOptions of benchmarkOptionsFile.fetchIpnsBenchmarkOptions) {
      await benchmarkChrome(benchmarkFile, benchmarkOptions)
    }
  }
}

// benchmark gateway fetch ipns
if (isBenchmark('gateway-fetch-ipns')) {
  console.log('benchmarking gateway-fetch-ipns...')
  const benchmarkFile = 'benchmark-gateway-fetch-ipns.js'
  if (isRuntime('node')) {
    for (const benchmarkOptions of benchmarkOptionsFile.gatewayFetchIpnsBenchmarkOptions) {
      fs.removeSync(benchmarkOptions.plebbitOptions.dataPath)
      await benchmarkNode(benchmarkFile, benchmarkOptions)
    }
  }
  if (isRuntime('chrome')) {
    for (const benchmarkOptions of benchmarkOptionsFile.gatewayFetchIpnsBenchmarkOptions) {
      await benchmarkChrome(benchmarkFile, benchmarkOptions)
    }
  }
}

await printReport()
server.close()
process.exit()
