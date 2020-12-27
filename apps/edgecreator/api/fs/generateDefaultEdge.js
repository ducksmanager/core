const fs = require('fs')
const svg2img = require('svg2img')

const REGEX_EDGE_URL = /^edges\/([^/]+)\/gen\/_?([^.]+)\.([^.]+)\.(.+)?$/

export default function (req, res) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers':
      'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,x-dm-user,x-dm-pass',
  }
  if (req.method === 'OPTIONS') {
    res.writeHeader(200, corsHeaders)
    res.end()
    return
  }
  const input = req.url.replace(/^\//, '')
  let text
  const match = input.match(REGEX_EDGE_URL)
  if (match) {
    const [, countryCode, magazineCode, issueNumber, extension] = match

    if (countryCode && extension !== 'png') {
      res.writeHeader(404, corsHeaders)
      res.end('')
      return
    }
    text = `${countryCode}/${magazineCode} ${issueNumber}`
  } else {
    text = input
  }

  const content = fs
    .readFileSync('assets/default.svg')
    .toString()
    .replace('My text', decodeURIComponent(text))
  svg2img(content, (error, buffer) => {
    if (error) {
      res.writeHeader(500, corsHeaders)
      res.end('Error : ' + error)
    }
    res.writeHeader(200, { ...corsHeaders, 'Content-Type': 'image/png' })
    res.end(buffer)
  })
}
