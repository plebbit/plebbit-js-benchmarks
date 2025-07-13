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
    reportPublish[subplebbitAddress] = {resolvingAddressTimeSeconds: null, fetchingIpnsTimeSeconds: null}
    let beforeTimestamp

    const getRandomString = () => (Math.random() + 1).toString(36).replace('.', '')
    const signer = await plebbit.createSigner()
    const comment = await plebbit.createComment({
      signer,
      subplebbitAddress,
      title: `I am the plebbit-js benchmark ${getRandomString()}`,
      content: `I am the plebbit-js benchmark ${getRandomString()}`
    })
    comment.on('error', commentErrorEvent => console.log('commentErrorEvent:', getCommentUrlPath(), commentErrorEvent.message))
    comment.once('challenge', () => {
      reportPublish[subplebbitAddress].challengeTimeSeconds = (Date.now() - beforeTimestamp) / 1000
      console.log(`received challenge ${subplebbitAddress} in ${reportPublish[subplebbitAddress].challengeTimeSeconds}s`)

      comment.publishChallengeAnswers(['plebbit-js benchmark wrong answer'])
    })
    comment.once('challengeverification', () => {
      reportPublish[subplebbitAddress].challengeVerificationTimeSeconds = (Date.now() - beforeTimestamp) / 1000
      console.log(`received challenge verification ${subplebbitAddress} in ${reportPublish[subplebbitAddress].challengeVerificationTimeSeconds}s`)

      resolve()
      comment.stop().catch(() => {})
    })
    comment.on('publishingstatechange', publishingState => {
      if (publishingState === 'resolving-subplebbit-address') {
        beforeTimestamp = Date.now()
      }
      if (publishingState === 'fetching-subplebbit-ipns') {
        if (reportPublish[subplebbitAddress].resolvingAddressTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportPublish[subplebbitAddress].resolvingAddressTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`resolved address ${subplebbitAddress} in ${reportPublish[subplebbitAddress].resolvingAddressTimeSeconds}s`)
      }
      if (publishingState === 'fetching-subplebbit-ipfs') {
        if (reportPublish[subplebbitAddress].fetchingIpnsTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportPublish[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`fetched ipns ${subplebbitAddress} in ${reportPublish[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
      }
      if (publishingState === 'publishing-challenge-request') {
        // not all plebbit options have fetching-ipfs state
        if (reportPublish[subplebbitAddress].fetchingIpnsTimeSeconds) {
          reportPublish[subplebbitAddress].fetchingIpfsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipfs ${subplebbitAddress} in ${reportPublish[subplebbitAddress].fetchingIpfsTimeSeconds}s`)
        }
        else {
          reportPublish[subplebbitAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipns ${subplebbitAddress} in ${reportPublish[subplebbitAddress].fetchingIpnsTimeSeconds}s`)
        }
      }
      if (publishingState === 'waiting-challenge') {
        reportPublish[subplebbitAddress].publishChallengeRequestTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`published challenge request ${subplebbitAddress} in ${reportPublish[subplebbitAddress].publishChallengeRequestTimeSeconds}s`)
      }
      if (publishingState === 'waiting-challenge-verification') {
        reportPublish[subplebbitAddress].publishChallengeAnswerTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`published challenge answer ${subplebbitAddress} in ${reportPublish[subplebbitAddress].publishChallengeAnswerTimeSeconds}s`)
      }
      if (publishingState === 'failed') {
        // TODO: plebbit-js bug, events aren't emitted in correct order so wait 100ms for all of them
        setTimeout(() => {
          console.log(`failed publish ${subplebbitAddress}`)
          resolve()
          comment.stop().catch(() => {})
        }, 100)
      }
      if (publishingState === 'waiting-retry') {
        // wait retry for 10s
        setTimeout(() => {
          console.log(`failed (waiting retry more than 10s)' publish ${subplebbitAddress}`)
          resolve()
          comment.stop().catch(() => {})
        }, 10000)
      }
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
      subplebbits: reportPublish
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
