const benchmarkOptionsType = 'publishBenchmarkOptions'
const benchmarkServerUrl = 'http://127.0.0.1:3000'

// fix unknown bug with viem in browser, that starts a new websocket connection per request
try {
  const OriginalWebSocket = window.WebSocket
  window.WebSocket = function (url, protocols) {
    return new OriginalWebSocket(url, protocols)
  }
} catch (e) {}

import Plebbit from '../node_modules/@plebbit/plebbit-js/dist/node/index.js'

it('benchmark', async function() {
  let benchmarkOptionsName, runtime
  try {
    benchmarkOptionsName = window.benchmarkOptionsName
    runtime = 'chrome'
  }
  catch (e) {
    benchmarkOptionsName = process.argv.includes('--benchmarkOptionsName') && process.argv[process.argv.indexOf('--benchmarkOptionsName') + 1]
    runtime = 'node'
  }
  if (!benchmarkOptionsName) {
    throw Error('missing benchmarkOptionsName')
  }
  const benchmarkOptions = await fetch(`${benchmarkServerUrl}/benchmark-options?benchmarkOptionsName=${benchmarkOptionsName}&benchmarkOptionsType=${benchmarkOptionsType}`).then(res => res.json())
  if (!benchmarkOptions) {
    throw Error('failed fetching benchmarkOptions')
  }

  const plebbitOptions = {
    ...benchmarkOptions.plebbitOptions,
  }
  const plebbit = await Plebbit(plebbitOptions)
  plebbit.on('error', plebbitErrorEvent => console.log('plebbitErrorEvent:', plebbitErrorEvent.message))

  const reportPublish = {}

  const publishComment = (subplebbitAddress) => new Promise(async resolve => {
    reportPublish[subplebbitAddress] = {fetchCommentIpfsTimeSeconds: null, resolvingSubplebbitAddressTimeSeconds: null, fetchingCommentUpdateTimeSeconds: null}
    let beforeFetchingCommentIpfsTimestamp



    const getRandomString = () => (Math.random() + 1).toString(36).replace('.', '')
    const signer = await plebbit.createSigner()
    const comment = await plebbit.createComment({
      signer,
      subplebbitAddress,
      title: `I am the plebbit-js benchmark ${getRandomString()}`,
      content: `I am the plebbit-js benchmark ${getRandomString()}`
    })
    comment.once('challenge', () => {
      comment.publishChallengeAnswers(['plebbit-js benchmark wrong answer'])
    })
    comment.once('challengeverification', () => {

    })
    comment.on('error', commentErrorEvent => console.log('commentErrorEvent:', getCommentUrlPath(), commentErrorEvent.message))
    comment.on('publishingstatechange', publishingState => {
      console.log(publishingState)
      // if (publishingState === 'fetching-ipfs') {
      //   beforeFetchingCommentIpfsTimestamp = Date.now()
      // }
      // if (publishingState === 'resolving-subplebbit-address') {
      //   reportPublish[commentCid].fetchCommentIpfsTimeSeconds = (Date.now() - beforeFetchingCommentIpfsTimestamp) / 1000
      //   console.log(`fetched comment ipfs ${getCommentUrlPath()} in ${reportPublish[commentCid].fetchCommentIpfsTimeSeconds}s`)

      //   beforeResolvingAddressTimestamp = Date.now()
      // }
      // if (publishingState === 'fetching-subplebbit-ipns') {
      //   if (reportPublish[commentCid].resolvingSubplebbitAddressTimeSeconds) {
      //     // already logged this once, might log again if waiting retry
      //     return
      //   }
      //   reportPublish[commentCid].resolvingSubplebbitAddressTimeSeconds = (Date.now() - beforeFetchingCommentIpfsTimestamp) / 1000
      //   console.log(`resolved subplebbit address ${getCommentUrlPath()} after ${reportPublish[commentCid].resolvingSubplebbitAddressTimeSeconds}s`)
      // }
      // if (publishingState === 'succeeded') {
      //   // TODO: plebbit-js bug, should only be state 'succeeded' after comment.updatedAt is defined
      //   if (!comment.updatedAt) {
      //     return
      //   }
      //   reportPublish[commentCid].fetchingCommentUpdateTimeSeconds = (Date.now() - beforeFetchingCommentIpfsTimestamp) / 1000
      //   console.log(`fetched comment update ${getCommentUrlPath()} in ${reportPublish[commentCid].fetchingCommentUpdateTimeSeconds}s`)
      //   resolve()
      //   comment.stop().catch(() => {})
      // }
      // if (publishingState === 'failed') {
      //   console.log(`failed fetching comment ${getCommentUrlPath()}`)
      //   resolve()
      //   comment.stop().catch(() => {})
      // }
      // if (publishingState === 'waiting-retry') {
      //   // wait retry for 10s
      //   setTimeout(() => {
      //     console.log(`failed (waiting retry more than 10s)' fetching comment ${getCommentUrlPath()}`)
      //     resolve()
      //     comment.stop().catch(() => {})
      //   }, 10000)
      // }
    })
    comment.publish()
  })

  const publish = async () => {
    console.log('publishing...')
    await publishComment(benchmarkOptions.subplebbitAddress)
    console.log('done publishing')
  }

  const writeReport = async () => {
    const report = {
      name: benchmarkOptions.name,
      type: benchmarkOptionsType,
      runtime,
      publish: reportPublish
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

  await publish()
  await writeReport()
  console.log(reportPublish)
  console.log(benchmarkOptions.name, 'done')

  try {
    process.exit()
  }
  catch (e) {}
})
