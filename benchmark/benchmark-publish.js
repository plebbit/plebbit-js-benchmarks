import { test } from 'vitest'

const benchmarkOptionsType = 'publishBenchmarkOptions'
const benchmarkServerUrl = 'http://127.0.0.1:3000'

// fix unknown bug with viem in browser, that starts a new websocket connection per request
try {
  const OriginalWebSocket = window.WebSocket
  window.WebSocket = function (url, protocols) {
    return new OriginalWebSocket(url, protocols)
  }
} catch (e) {}

import PKC from '../node_modules/@pkcprotocol/pkc-js/dist/node/index.js'

// wait to reply to challenge to emulate real scenario
const publishChallengeAnswerDelay = 1000 * 10

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
  const reportPublish = {}

  const publishComment = (communityAddress) => new Promise(async resolve => {
    reportPublish[communityAddress] = {
      resolvingAddressTimeSeconds: null,
      fetchingIpnsTimeSeconds: null,
      challengeRequestTimeSeconds: null,
      challengeTimeSeconds: null,
      challengeAnswerTimeSeconds: null,
      challengeVerificationTimeSeconds: null
    }
    let beforeTimestamp

    const getRandomString = () => (Math.random() + 1).toString(36).replace('.', '')
    const signer = await pkc.createSigner()
    const comment = await pkc.createComment({
      signer,
      communityAddress,
      title: `I am the pkc-js benchmark ${getRandomString()}`,
      content: `I am the pkc-js benchmark ${getRandomString()}`
    })
    comment.on('error', commentErrorEvent => console.log('commentErrorEvent:', getCommentUrlPath(), commentErrorEvent.message))
    comment.once('challenge', async () => {
      reportPublish[communityAddress].challengeTimeSeconds = (Date.now() - beforeTimestamp) / 1000
      console.log(`received challenge ${communityAddress} in ${reportPublish[communityAddress].challengeTimeSeconds}s`)

      // wait to reply to challenge to emulate real scenario
      console.log(`waiting ${publishChallengeAnswerDelay / 1000}s before publishing challenge answer...`)
      await new Promise(r => setTimeout(r, publishChallengeAnswerDelay))
      beforeTimestamp += publishChallengeAnswerDelay
      comment.publishChallengeAnswers(['pkc-js benchmark wrong answer'])
    })
    comment.once('challengeverification', () => {
      reportPublish[communityAddress].challengeVerificationTimeSeconds = (Date.now() - beforeTimestamp) / 1000
      console.log(`received challenge verification ${communityAddress} in ${reportPublish[communityAddress].challengeVerificationTimeSeconds}s`)

      resolve()
      comment.stop().catch(() => {})
    })
    comment.on('publishingstatechange', publishingState => {
      if (publishingState === 'resolving-subplebbit-address') {
        beforeTimestamp = Date.now()
      }
      if (publishingState === 'fetching-subplebbit-ipns') {
        if (reportPublish[communityAddress].resolvingAddressTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportPublish[communityAddress].resolvingAddressTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`resolved address ${communityAddress} in ${reportPublish[communityAddress].resolvingAddressTimeSeconds}s`)
      }
      if (publishingState === 'fetching-subplebbit-ipfs') {
        if (reportPublish[communityAddress].fetchingIpnsTimeSeconds) {
          // already logged this once, might log again if waiting retry
          return
        }
        reportPublish[communityAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`fetched ipns ${communityAddress} in ${reportPublish[communityAddress].fetchingIpnsTimeSeconds}s`)
      }
      if (publishingState === 'publishing-challenge-request') {
        // not all pkc options have fetching-ipfs state
        if (reportPublish[communityAddress].fetchingIpnsTimeSeconds) {
          reportPublish[communityAddress].fetchingIpfsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipfs ${communityAddress} in ${reportPublish[communityAddress].fetchingIpfsTimeSeconds}s`)
        }
        else {
          reportPublish[communityAddress].fetchingIpnsTimeSeconds = (Date.now() - beforeTimestamp) / 1000
          console.log(`fetched ipns ${communityAddress} in ${reportPublish[communityAddress].fetchingIpnsTimeSeconds}s`)
        }

        beforeTimestamp = Date.now()
      }
      if (publishingState === 'waiting-challenge') {
        reportPublish[communityAddress].challengeRequestTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`published challenge request ${communityAddress} in ${reportPublish[communityAddress].challengeRequestTimeSeconds}s`)
      }
      if (publishingState === 'waiting-challenge-verification') {
        reportPublish[communityAddress].challengeAnswerTimeSeconds = (Date.now() - beforeTimestamp) / 1000
        console.log(`published challenge answer ${communityAddress} in ${reportPublish[communityAddress].challengeAnswerTimeSeconds}s`)
      }
      if (publishingState === 'failed') {
        // TODO: pkc-js bug, events aren't emitted in correct order so wait 100ms for all of them
        setTimeout(() => {
          console.log(`failed publish ${communityAddress}`)
          resolve()
          comment.stop().catch(() => {})
        }, 100)
      }
      if (publishingState === 'waiting-retry') {
        // wait retry for 10s
        setTimeout(() => {
          console.log(`failed (waiting retry more than 10s)' publish ${communityAddress}`)
          resolve()
          comment.stop().catch(() => {})
        }, 10000)
      }
    })
    comment.publish()

    // in case pkc-js doesn't time out fast enough
    setTimeout(() => {
      console.log(`failed publish timed out 2min ${communityAddress}`)
      resolve()
      comment.stop().catch(() => {})
    }, 1000 * 60 * 2)
  })

  const publish = async () => {
    console.log('publishing...')
    await publishComment(benchmarkOptions.communityAddress)
    console.log('done publishing')
  }

  const writeReport = async () => {
    const report = {
      name: benchmarkOptions.name,
      type: benchmarkOptionsType,
      timestamp: Date.now(),
      timeSeconds: (Date.now() - beforeReportTimestamp) / 1000,
      runtime,
      communities: reportPublish
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
