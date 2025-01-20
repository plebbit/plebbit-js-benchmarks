import path from 'path'
import fs from 'fs-extra'
import {fileURLToPath} from 'url'

const rootFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFolder = path.resolve(rootFolder, 'webpacked')

const entries = {
  'benchmark-resolve-addresses': './lib/benchmark-resolve-addresses.js',
}

export default {
  // each file is its own entry
  entry: entries,

  output: {
    // output each test entry to its own file name
    filename: '[name].js',
    path: outputFolder,

    // clean the dist folder on each rebuild
    clean: true,
  },

  module: {
    rules: [
      // fix the plebbit js import for browser
      {
        test: /\.js$/,
        loader: "string-replace-loader",
        options: {
            search: "node_modules/@plebbit/plebbit-js/dist/node/index.js",
            replace: "node_modules/@plebbit/plebbit-js/dist/browser/index.js",
            flags: "g"
        }
      }
    ]
  }
}
