import { test } from 'vitest'

const benchmarkOptionsType = 'fetchCommentBenchmarkOptions'
const benchmarkServerUrl = 'http://127.0.0.1:3000'

// debug node
// import util from 'util'
// util.inspect.defaultOptions.depth = 6
// import '../lib/debug-http.js'

// fix unknown bug with viem in browser, that starts a new websocket connection per request
try {
  const OriginalWebSocket = window.WebSocket
  window.WebSocket = function (url, protocols) {
    return new OriginalWebSocket(url, protocols)
  }
} catch (e) {}

import PKC from '../node_modules/@pkc/pkc-js/dist/node/index.js'

test('benchmark', async () => {
  let benchmarkOptionsName, runtime
  try {
    benchmarkOptionsName = window.benchmarkOptionsName
    runtime = 'chrome'
  }
  catch (e) {
    benchmarkOptionsName = process.env.BENCHMARK_OPTIONS_NAME || (process.argv.includes('--benchmarkOptionsName') && process.argv[process.argv.indexOf('--benchmarkOptionsName') + 1])
    runtime = 'node'
  }
  if (!benchmarkOptionsName) {
    throw Error('missing benchmarkOptionsName')
  }
  const benchmarkOptions = await fetch(`${benchmarkServerUrl}/benchmark-options?benchmarkOptionsName=${benchmarkOptionsName}&benchmarkOptionsType=${benchmarkOptionsType}`).then(res => res.json())
  if (!benchmarkOptions) {
    throw Error('failed fetching benchmarkOptions')
  }

  const pkcOptions = {
    ...benchmarkOptions.pkcOptions,
  }
  const pkc = await PKC(pkcOptions)
  pkc.on('error', pkcErrorEvent => console.log('pkcErrorEvent:', pkcErrorEvent.message))

  const beforeReportTimestamp = Date.now()
  const reportComments = {}

  const fetchComment = (commentCid) => new Promise(async resolve => {
    reportComments[commentCid] = {fetchCommentIpfsTimeSeconds: null, resolvingCommunityAddressTimeSeconds: null, fetchingCommentUpdateTimeSeconds: null}
    let beforeTimestamp
    const comment = await pkc.createComment({cid: commentCid})
    const getCommentUrlPath = () => comment.communityAddress ? `p/${comment.communityAddress}/c/${commentCid}` : `c/${commentCid}`

    comment.on('error', commentErrorEvent => console.log('commentErrorEvent:', getCommentUrlPath(), commentErrorEvent.message))
    comment.on('updatingstatechange', updatingState => {
      if (updatingState === 'fetching-ipfs') {
        beforeTimestamp = Date.now()
      }
      if (updatingState === 'resolving-subplebbit-address') {
        reportComments[commentCid].fetchCommentIpfsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`fetched comment ipfs ${getCommentUrlPath()} in ${reportComments[commentCid].fetchCommentIpfsTimeSeconds}s`)
      }
      if (updatingState === 'fetching-subplebbit-ipns') {
        if (reportComments[commentCid].resolvingCommunityAddressTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportComments[commentCid].resolvingCommunityAddressTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`resolved community address ${getCommentUrlPath()} after ${reportComments[commentCid].resolvingCommunityAddressTimeSeconds}s`)
      }
      if (updatingState === 'succeeded') {
        // TODO: pkc-js bug, should only be state 'succeeded' after comment.updatedAt is defined
        if (!comment.updatedAt) {
          return
        }
        reportComments[commentCid].fetchingCommentUpdateTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`fetched comment update ${getCommentUrlPath()} in ${reportComments[commentCid].fetchingCommentUpdateTimeSeconds}s`)
        resolve()
        comment.stop().catch(() => {})
      }
      if (updatingState === 'failed') {
        console.log(`failed fetching comment ${getCommentUrlPath()}`)
        resolve()
        comment.stop().catch(() => {})
      }
      if (updatingState === 'waiting-retry') {
        // wait retry for 10s
        setTimeout(() => {
          console.log(`failed (waiting retry more than 10s)' fetching comment ${getCommentUrlPath()}`)
          resolve()
          comment.stop().catch(() => {})
        }, 10000)
      }
    })
    comment.update()

    // in case pkc-js doesn't time out fast enough
    setTimeout(() => {
      console.log(`failed fetching comment timed out 2min ${getCommentUrlPath()}`)
      resolve()
      comment.stop().catch(() => {})
    }, 1000 * 60 * 2)
  })

  const fetchComments = async () => {
    console.log('fetching comments...')
    const promises = benchmarkOptions.commentCids.map(fetchComment)
    await Promise.all(promises)
    console.log('done fetching comments')
  }

  const writeReport = async () => {
    const report = {
      name: benchmarkOptions.name,
      type: benchmarkOptionsType,
      timestamp: Date.now(),
      timeSeconds: (Date.now() - beforeReportTimestamp) / 1000,
      runtime,
      comments: reportComments
    }
    const res = await fetch(`${benchmarkServerUrl}/report`, {
      method: 'POST',
      body: JSON.stringify(report),
      headers: {'Content-Type': 'application/json'}
    })
    if (res.status !== 200) {
      throw Error('failed writing report')
    }
  }

  await fetchComments()
  await writeReport()
  console.log(reportComments)
  console.log(benchmarkOptions.name, 'done')

  try {
    process.exit()
  }
  catch (e) {}
})
