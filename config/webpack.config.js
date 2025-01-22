import path from 'path'
import fs from 'fs-extra'
import {fileURLToPath} from 'url'

const rootFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFolder = path.resolve(rootFolder, 'webpacked')
const benchmarkFolder = path.resolve(rootFolder, 'benchmark')

const entries = {}
for (const benchmarkFile of fs.readdirSync(benchmarkFolder)) {
  entries[benchmarkFile] = path.resolve(benchmarkFolder, benchmarkFile)
}
console.log(entries)

export default {
  // each file is its own entry
  entry: entries,

  output: {
    // output each test entry to its own file name
    filename: '[name]',
    path: outputFolder,

    // clean the dist folder on each rebuild
    clean: true,
  },

  module: {
    rules: [
      // fix the plebbit js import for browser
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
            search: 'node_modules/@plebbit/plebbit-js/dist/node/index.js',
            replace: 'node_modules/@plebbit/plebbit-js/dist/browser/index.js',
            flags: 'g'
        }
      },

      // plebbit-js doesn't need babel, but we should write our tests
      // with it to make sure it doesn't break for users who use it
      // like react users for example
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: [
      //         // the most common option used by people
      //         [
      //           '@babel/preset-env',
      //           // same browsers as seedit, we cant support browsers that are too old because of BigInt
      //           // {targets: {browsers: ['chrome >= 67', 'edge >= 79', 'firefox >= 68', 'opera >= 54', 'safari >= 14']}}
      //           {targets: {browsers: ['last 1 chrome version']}}
      //         ]
      //       ]
      //     }
      //   }
      // }
    ]
  }
}
