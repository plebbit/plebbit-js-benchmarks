import http from 'http'

// const response = {
//   "Providers": [
//     {
//       "Schema": "peer",
//       "Addrs": [
//         // "/p2p-circuit",
//         "/dns4/194-11-226-35.k51qzi5uqu5dhlxz4gos5ph4wivip9rgsg6tywpypccb403b0st1nvzhw8as9q.libp2p.direct/tcp/4001/tls/ws/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
//         // "/ip4/194.11.226.35/tcp/4001/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
//         // "/ip4/194.11.226.35/udp/4001/quic-v1/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
//         // "/ip4/194.11.226.35/udp/4001/quic-v1/webtransport/certhash/uEiDoZEZIxNQKgOTGBljtt-bfsdqUttPFdaHh0sCzUXoXkA/certhash/uEiD4YPjMir-rRL-wOOJYs4ZgcBGpq5vjdo4K05i5Jf2PYQ/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
//         // "/ip4/194.11.226.35/udp/4001/webrtc-direct/certhash/uEiBTGmaUFn_gmv2itf7rs8clkz08SVHf0T-6d8ksgLDOZQ/p2p/12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V"
//       ],
//       "ID": "12D3KooWDfnXqdZfsoqKbcYEDKRttt3adumB5m6tw8YghPwMAz8V",
//       "Protocols": ["transport-bitswap"]
//     }
//   ]
// }

const response = {
  "Providers": [
    {
      "Schema": "peer",
      "Addrs": [
        // "/dns4/89-36-231-48.k51qzi5uqu5dlc54b8qqejf4mxjuzjdpi4aubj1iduu57gxqtxfawitxwniw0b.libp2p.direct/tcp/4001/tls/ws/p2p/12D3KooWPjd6LyLDjK8Mrs4eRYNLsCYM3Yh9j4vpCgQXFazwSRP8",
        "/ip4/89.36.231.48/tcp/4001/p2p/12D3KooWPjd6LyLDjK8Mrs4eRYNLsCYM3Yh9j4vpCgQXFazwSRP8",
        // "/ip4/89.36.231.48/udp/4001/quic-v1/p2p/12D3KooWPjd6LyLDjK8Mrs4eRYNLsCYM3Yh9j4vpCgQXFazwSRP8",
        // "/ip4/89.36.231.48/udp/4001/quic-v1/webtransport/certhash/uEiBpK5Khfla8Lu6nvWxGGgJ5nr8xjtpTst9bc_ohsubG6Q/certhash/uEiB9cKLu7ikLlcbTRguCcwX8RKLVJPxOP-FjEQYG96WTvw/p2p/12D3KooWPjd6LyLDjK8Mrs4eRYNLsCYM3Yh9j4vpCgQXFazwSRP8",
        // "/ip4/89.36.231.48/udp/4001/webrtc-direct/certhash/uEiBs3l8UlrCCy9owOSU8Cn3uQsU3iqudGJHNDEw73ZVpdQ/p2p/12D3KooWPjd6LyLDjK8Mrs4eRYNLsCYM3Yh9j4vpCgQXFazwSRP8"
      ],
      "ID": "12D3KooWPjd6LyLDjK8Mrs4eRYNLsCYM3Yh9j4vpCgQXFazwSRP8",
      "Protocols": ["transport-bitswap"]
    }
  ]
}

const server = http.createServer((req, res) => {
  const json = JSON.stringify(response)
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*'
  })
  res.end(json)
})

const port = 9999
server.listen(port, () => {
  console.log(`http router listening on port ${port}`)
})
