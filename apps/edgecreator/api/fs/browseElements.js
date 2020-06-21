const fs = require('fs')

export default function (req, res) {
  const [country, magazine] = req.url.match(/[a-z]+\/[-A-Z0-9]+$/)[0].split('/')
  if (!country || !magazine) {
    res.statusCode = 400
    res.end()
  }
  fs.readdir(`${process.env.EDGES_PATH}/${country}/elements`, (err, items) => {
    if (err) {
      res.statusCode = 500
      res.end()
    }

    res.writeHeader(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify(
        items.filter((item) => new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item))
      )
    )
  })
}
