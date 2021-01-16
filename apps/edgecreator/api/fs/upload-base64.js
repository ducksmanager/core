import axios from 'axios'
import { addAxiosInterceptor, returnError } from '../api'

const fs = require('fs')
const base64Img = require('base64-img')
const edgesPath = process.env.EDGES_PATH

addAxiosInterceptor()

export default async function (req, res) {
  if (req.method === 'POST') {
    const { country, issuenumber, magazine, data } = req.body
    const path = `${edgesPath}/${country}/photos`
    const tentativeFileName = `${magazine}.${issuenumber}.photo`
    const fileName = getNextAvailableFile(`${path}/${tentativeFileName}`, 'jpg').match(
      /\/([^/]+)$/
    )[1]

    base64Img.imgSync(data, path, fileName.replace('.jpg', ''))

    try {
      const publicationcode = `${country}/${magazine}`
      await axios.put(
        `${process.env.BACKEND_URL}/edgecreator/multiple_edge_photo/v2`,
        {
          publicationcode,
          issuenumber,
        },
        { headers: req.headers }
      )
    } catch (e) {
      returnError(res, e)
    }

    res.writeHead(200, { Connection: 'close', 'Content-Type': 'application/text' })
    res.end(JSON.stringify({ filename: fileName }))
  } else {
    res.writeHead(400, { Connection: 'close', 'Content-Type': 'application/text' })
    res.end('Only POST is allowed')
  }
}
const getNextAvailableFile = (prefix, extension) => {
  let i = 1
  let filename
  do {
    filename = `${prefix}_${i++}.${extension}`
  } while (fs.existsSync(filename))

  return filename
}
