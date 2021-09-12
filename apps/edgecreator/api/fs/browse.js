const fs = require('fs')

export default function (req, res) {
  const [imageType, country, magazine] = req.url
    .match(/(elements|photos)+\/[a-z]+\/[-A-Z0-9]+$/)[0]
    .split('/')
  if (!country || !magazine) {
    res.statusCode = 400
    res.end()
  }
  fs.readdir(
    `${process.env.EDGES_PATH}/${country}/${imageType}`,
    (err, items) => {
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      if (err) {
        res.end(JSON.stringify([]))
      } else {
        res.end(
          JSON.stringify(
            items.filter((item) =>
              new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item)
            )
          )
        )
      }
    }
  )
}
