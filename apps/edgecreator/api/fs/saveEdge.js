const fs = require('fs')

export default function (req, res) {
  const { country, magazine, issuenumber, content } = req.body
  const fileName = `${req.body.export ? '' : '_'}${magazine}.${issuenumber}.svg`
  const path = `${process.env.EDGES_PATH}/${country}/gen/${fileName}`

  fs.mkdirSync(require('path').dirname(path), { recursive: true })
  fs.writeFile(path, content, function () {
    res.writeHeader(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ path }))
  })
}
