const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer()

export default function (req, res) {
  try {
    proxy.web(req, res, {
      target: process.env.EDGES_URL,
    })
  } catch (e) {
    res.writeHeader(500)
    res.end(e)
  }
}
