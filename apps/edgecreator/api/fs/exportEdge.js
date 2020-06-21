const fs = require('fs')

export default function (req, res) {
  const { country, magazine, issuenumber, content } = req.body
  fs.writeFile(
    `${process.env.EDGES_PATH}/${country}/gen/${magazine}.${issuenumber}.svg`,
    content,
    function () {
      res.end()
    }
  )
}
