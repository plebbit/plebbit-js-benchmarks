const failUrl = 'http://127.0.0.2'

let benchmarkOptions
try {
  benchmarkOptions = JSON.parse(process.argv[2])
}
catch (e) {
  throw Error(`failed parsing benchmarkOptions: ${e.message}`)
}

console.log({benchmarkOptions})

import './debug-http.js'
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.dirname(fileURLToPath(import.meta.url))
const reportPath = path.join(rootPath, 'report.json')
import Plebbit from '@plebbit/plebbit-js'
import fs from 'fs-extra'
import util from 'util'
util.inspect.defaultOptions.depth = 6

const plebbitDataPath = '.plebbit-benchmark'
fs.removeSync(plebbitDataPath)

const plebbitOptions = {
  ...benchmarkOptions.plebbitOptions,
  ipfsGatewayUrls: [failUrl],
  dataPath: plebbitDataPath,
}
const plebbit = await Plebbit(plebbitOptions)
plebbit.on('error', plebbitErrorEvent => console.log({plebbitErrorEvent}))

const reportSubplebbits = {}

const fetchSubplebbit = (subplebbitAddress) => new Promise(async resolve => {
  reportSubplebbits[subplebbitAddress] = {}
  let beforeResolvingAddressTimestamp
  const subplebbit = await plebbit.createSubplebbit({address: subplebbitAddress})
  subplebbit.on('error', subplebbitErrorEvent => console.log({subplebbitAddress, subplebbitErrorEvent}))
  subplebbit.on('updatingstatechange', updatingState => {
    if (updatingState === 'resolving-address') {
      beforeResolvingAddressTimestamp = Date.now()
    }
    if (updatingState === 'fetching-ipns') {
      reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds = (Date.now() - beforeResolvingAddressTimestamp) / 1000
      console.log(`resolved address ${subplebbitAddress} in ${reportSubplebbits[subplebbitAddress].resolvingAddressTimeSeconds}s`)
      subplebbit.stop()
      resolve()
    }
  })
  subplebbit.update()
})

const fetchSubplebbits = async () => {
  console.log('fetching subplebbits...')
  const promises = benchmarkOptions.subplebbitAddresses.map(fetchSubplebbit)
  await Promise.all(promises)
}

const writeReport = () => {
  let reports = []
  try {
    reports = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
  }
  catch (e) {}
  const report = {
    name: benchmarkOptions.name,
    subplebbits: reportSubplebbits
  }
  reports.push(report)
  fs.writeFileSync(reportPath, JSON.stringify(reports))
}

await fetchSubplebbits()
writeReport()
console.log(reportSubplebbits)
console.log(benchmarkOptions.name, 'done')
process.exit()
