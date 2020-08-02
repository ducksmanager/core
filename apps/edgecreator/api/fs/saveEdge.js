const fs = require('fs')
const svg2img = require('svg2img')

export default function (req, res) {
  const { runExport, country, magazine, issuenumber, content } = req.body
  const fileName = `${runExport ? '' : '_'}${magazine}.${issuenumber}.svg`
  const svgPath = `${process.env.EDGES_PATH}/${country}/gen/${fileName}`

  fs.mkdirSync(require('path').dirname(svgPath), { recursive: true })
  fs.writeFile(svgPath, content, function () {
    let paths = { svgPath }
    if (runExport) {
      const pngPath = svgPath.replace('.svg', '.png')
      svg2img(content, (error, buffer) => {
        fs.writeFile(pngPath, buffer, function () {
          paths = { ...paths, pngPath }

          if (error) {
            res.writeHeader(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error }))
          } else {
            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(paths))
          }
        })
      })
    } else {
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(paths))
    }
  })
}
