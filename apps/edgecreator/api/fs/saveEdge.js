import axios from 'axios'
import { addAxiosInterceptor } from '../api'

const fs = require('fs')
const svg2img = require('svg2img')

addAxiosInterceptor()

export default function (req, res) {
  const { runExport, country, magazine, issuenumber, designers, photographers, content } = req.body
  const fileName = `${runExport ? '' : '_'}${magazine}.${issuenumber}.svg`
  const svgPath = `${process.env.EDGES_PATH}/${country}/gen/${fileName}`
  const publicationCode = `${country}/${magazine}`

  fs.mkdirSync(require('path').dirname(svgPath), { recursive: true })
  fs.writeFile(svgPath, content, function () {
    let paths = { svgPath }
    if (runExport) {
      const pngPath = svgPath.replace('.svg', '.png')
      svg2img(content, (error, buffer) => {
        fs.writeFile(pngPath, buffer, async function () {
          paths = { ...paths, pngPath }

          try {
            await axios.put(
              `${process.env.BACKEND_URL}/edgecreator/publish/${publicationCode}/${issuenumber}`,
              {
                designers: designers.map(({ username }) => username),
                photographers: photographers.map(({ username }) => username),
              },
              { headers: req.headers }
            )
          } catch (e) {
            returnError(e)
          }

          if (error) {
            returnError(res, error)
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

const returnError = (res, error) => {
  res.writeHeader(500, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error }))
}
