const fs = require('fs')
const svg2img = require('svg2img')

const REGEX_EDGE_URL = /^edges\/([^/]+\/)gen\/_?([^.]+)\.([^.]+)\.(svg|png)?$/

export default function (req, res) {
  res.writeHeader(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers':
      'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,x-dm-user,x-dm-pass',
  })
  if (req.method === 'OPTIONS') {
    res.end()
  }
  const text = req.url.replace(/^\//, '').replace(REGEX_EDGE_URL, `$1$2 $3`)

  const content = fs
    .readFileSync('assets/default.svg')
    .toString()
    .replace('My text', decodeURIComponent(text))
  svg2img(content, (error, buffer) => {
    if (error) {
      res.writeHeader(500)
      res.end('Error : ' + error)
    }
    res.writeHeader(200, { 'Content-Type': 'image/png' })
    res.end(buffer)
  })
}
