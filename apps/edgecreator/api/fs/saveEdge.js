import axios from 'axios'
import { addAxiosInterceptor, checkUserRoles, returnError } from '../api'

const fs = require('fs')
const sharp = require('sharp')

addAxiosInterceptor()

export default async function (req, res) {
  const { runExport, runSubmit, country, magazine, issuenumber, contributors, content } = req.body
  if (
    !(await checkUserRoles(
      req,
      res,
      (userRoles) => userRoles.includes('admin') || (userRoles.includes('edit') && !runExport)
    ))
  ) {
    return
  }

  const svgPath = getSvgPath(runExport, country, magazine, issuenumber)
  const publicationcode = `${country}/${magazine}`

  fs.mkdirSync(require('path').dirname(svgPath), { recursive: true })
  fs.writeFile(svgPath, content, async () => {
    let paths = { svgPath }
    if (runExport) {
      const pngPath = svgPath.replace('.svg', '.png')
      sharp(svgPath)
        .png()
        .toFile(pngPath)
        .then(async () => {
          paths = { ...paths, pngPath }

          const { designers, photographers } = contributors

          try {
            await axios.put(
              `${process.env.BACKEND_URL}/edgecreator/publish/${publicationcode}/${issuenumber}`,
              {
                designers: (designers || []).map(({ username }) => username),
                photographers: (photographers || []).map(({ username }) => username),
              },
              { headers: req.headers }
            )
            fs.unlinkSync(getSvgPath(false, country, magazine, issuenumber))

            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(paths))
          } catch (e) {
            returnError(res, e)
          }
        })
        .catch((error) => {
          returnError(res, error)
        })
    } else {
      if (runSubmit) {
        try {
          await axios.put(
            `${process.env.BACKEND_URL}/edgecreator/submit`,
            {
              publicationcode,
              issuenumber,
            },
            { headers: req.headers }
          )
        } catch (e) {
          returnError(res, e)
        }
      }
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(paths))
    }
  })
}

const getSvgPath = (isExport, country, magazine, issuenumber) =>
  `${process.env.EDGES_PATH}/${country}/gen/${isExport ? '' : '_'}${magazine}.${issuenumber}.svg`
