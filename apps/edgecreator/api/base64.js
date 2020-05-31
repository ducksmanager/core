const request = require('request').defaults({ encoding: null })
const sizeOf = require('image-size')

export default function(req, res) {
  const url = `http://localhost:8000/edges/${req.url.replace(/^\/\?/, '')}`
  request.get(url, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const buffer = Buffer.from(body)
      const dimensions = sizeOf(buffer)
      const base64 = `data:${
        response.headers['content-type']
      };base64,${buffer.toString('base64')}`
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ dimensions, base64, url }))
    } else {
      res.statusCode = response.statusCode
      res.end()
    }
  })
}
