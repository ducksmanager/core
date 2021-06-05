const request = require('request').defaults({ encoding: null })
const sizeOf = require('image-size')

export default function (req, res) {
  const targetUrl = req.url.replace(/^\/\?/, '')
  const url =
    targetUrl.indexOf('https://res.cloudinary.com') === 0
      ? targetUrl
      : `${process.env.EDGES_URL}/${targetUrl}`
  request.get(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      try {
        const buffer = Buffer.from(body)
        const dimensions = sizeOf(buffer)
        const base64 = `data:${response.headers['content-type']};base64,${buffer.toString(
          'base64'
        )}`
        res.writeHeader(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ dimensions, base64, url }))
      } catch (e) {
        console.error(targetUrl + ' : ' + e)
        res.statusCode = 404
        res.end()
      }
    } else {
      res.statusCode = response.statusCode
      res.end()
    }
  })
}
