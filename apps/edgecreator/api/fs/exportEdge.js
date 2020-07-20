const fs = require('fs')

export default function (req, res) {
  const { country, magazine, issuenumber, content } = req.body
  const path = `${process.env.EDGES_PATH}/${country}/gen/${magazine}.${issuenumber}.svg`
  fs.mkdirSync(require('path').dirname(path), { recursive: true })
  fs.writeFile(path, content, function () {
    res.end()
  })
}
