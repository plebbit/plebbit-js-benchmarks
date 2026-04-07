// can use this file to modify pkc-js in node modules

import fs from 'fs-extra'
import {fileURLToPath} from 'url'
import path from 'path'
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkcJsDistPath = path.join(rootPath, 'node_modules/@pkc/pkc-js/dist')

const runtimes = ['node', 'browser']
for (const runtime of runtimes) {
  const pkcJsRootPath = path.join(pkcJsDistPath, runtime)

  // add websocket transport to viem
  // const resolverPath = path.join(pkcJsRootPath, 'resolver.js')
  // let resolver = fs.readFileSync(resolverPath, 'utf-8')
  // if (!fs.existsSync(resolverPath + '.back')) {
  //   fs.writeFileSync(resolverPath + '.back', resolver)
  // }
  // resolver = resolver.replace(`http } from "viem";`, `http, webSocket } from "viem";`)
  // resolver = resolver.replace(`transport: http(chainProviderUrl)`, `transport: chainProviderUrl.startsWith('ws') ? webSocket(chainProviderUrl) : http(chainProviderUrl)`)
  // fs.writeFileSync(resolverPath, resolver)
}
