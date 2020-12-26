const fs = require('fs')
const svg2img = require('svg2img')

export default function (req, res) {
  const content = fs
    .readFileSync('assets/default.svg')
    .toString()
    .replace('My text', decodeURIComponent(req.url.replace(/^\//, '')))
  svg2img(content, (error, buffer) => {
    if (error) {
      res.writeHeader(500)
      res.end('Error : ' + error)
    }
    res.writeHeader(200, { 'Content-Type': 'image/png' })
    res.end(buffer)
  })
}
