import { addAxiosInterceptor } from '../api'

const fs = require('fs')
const base64Img = require('base64-img')
const edgesPath = process.env.EDGES_PATH

addAxiosInterceptor()

export default async function (req, res) {
  if (req.method === 'POST') {
    const path = `${edgesPath}/${req.body.country}/photos`
    const tentativeFileName = `${req.body.magazine}.${req.body.issuenumber}.photo`
    const fileName = getNextAvailableFile(`${path}/${tentativeFileName}`, 'jpg').match(
      /\/([^/]+)$/
    )[1]

    base64Img.imgSync(req.body.data, path, fileName.replace('.jpg', ''))

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
