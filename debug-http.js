const failUrl = 'http://127.0.0.2'

import http from 'http'
import https from 'https'
import {EventEmitter} from 'events'
const originalEmit = EventEmitter.prototype.emit

if (process.env.DEBUG_HTTP) {
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
}

if (process.env.DEBUG_HTTP_TIME) {
  const originalHttpRequest = http.request
  http.request = function (...args) {
    const req = originalHttpRequest.apply(this, args)
    if (!args[0].startsWith(failUrl)) {
      const startTime = Date.now()
      req.on('response', (res) => {
        const durationSeconds = (Date.now() - startTime) / 1000
        console.log('https.request', args[0], durationSeconds + 's')
      })
    }
    return req
  }

  const originalHttpsRequest = https.request
  https.request = function (...args) {
    const req = originalHttpsRequest.apply(this, args)
    if (!args[0].startsWith(failUrl)) {
      const startTime = Date.now()
      req.on('response', (res) => {
        const durationSeconds = (Date.now() - startTime) / 1000
        console.log('https.request', args[0], durationSeconds + 's')
      })
    }
    return req
  }

  if (globalThis.fetch) {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async function (...args) {
      const startTime = Date.now()
      const originalResponse = await originalFetch.apply(this, args)
      const headersReceivedTime = Date.now()
      const headersDuration = headersReceivedTime - startTime

      // mock response
      const response = new Response(
        originalResponse.body,
        {
          status: originalResponse.status,
          statusText: originalResponse.statusText,
          headers: originalResponse.headers,
        }
      )
      Object.defineProperties(response, {
        ok: { value: originalResponse.ok },
        redirected: { value: originalResponse.redirected },
        type: { value: originalResponse.type },
        url: { value: originalResponse.url },
      })
      const readBody = async () => {
        const bodyStartTime = Date.now()
        const body = await originalResponse.text()
        const bodyEndTime = Date.now()
        const totalTimeSeconds = (bodyEndTime - startTime) / 1000
        console.log('fetch', args[0], totalTimeSeconds + 's')
        return body
      }
      response.text = async () => readBody()
      response.json = async () => JSON.parse(await readBody())
      return response
    }
  }

  EventEmitter.prototype.emit = function (event, ...args) {
    if (event === 'request') {
      console.log(`emit('request')`, args)
    }
    return originalEmit.call(this, event, ...args)
  }
}
