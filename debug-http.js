const failUrl = 'http://127.0.0.2'

import http from 'http'
import https from 'https'
import {EventEmitter} from 'events'
const originalEmit = EventEmitter.prototype.emit

const originalHttpRequest = http.request
http.request = function (...args) {
  if (!args[0].startsWith(failUrl)) {
    console.log('http.request', args[0])
  }
  return originalHttpRequest.apply(this, args)
}

const originalHttpsRequest = https.request
https.request = function (...args) {
  if (!args[0].startsWith(failUrl)) {
    console.log('https.request', args[0])
  }
  return originalHttpsRequest.apply(this, args)
}

if (globalThis.fetch) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async function (...args) {
    if (!args[0].startsWith(failUrl)) {
      console.log('fetch', args[0])
    }
    return originalFetch.apply(this, args)
  }
}

EventEmitter.prototype.emit = function (event, ...args) {
  if (event === 'request') {
    console.log(`emit('request')`, args)
  }
  return originalEmit.call(this, event, ...args)
}
