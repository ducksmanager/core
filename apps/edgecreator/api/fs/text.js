import axios from 'axios'
import { addAxiosInterceptor } from '../api'
const fs = require('fs')

const fontImageDirPath = `${process.env.EDGES_PATH}/images_myfonts/`
const fontHashes = {}

addAxiosInterceptor()

export default function (req, res) {
  axios
    .get(`${process.env.BACKEND_URL}/edgecreator/myfontspreview${req.url}`, {
      headers: req.headers,
    })
    .then(({ data }) => {
      console.log(`Found an existing text : id=${data.result.id}`)
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ imageId: data.result.id }))
    })
    .catch(({ response }) => {
      if (response.status === 404) {
        console.log(`Found no existing text, generating text image...`)
        generateImage(req, response.data, req.headers.imageWidth)
          .then(({ data }) => {
            console.log(`Text image generated: id=${data.imageId}`)
            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ imageId: data.imageId }))
          })
          .catch(({ response }) => {
            res.statusCode = response.status
            res.end()
          })
      } else {
        res.statusCode = response.status
        res.end()
      }
    })
}

const generateImage = (req, parameters, imageWidth) => {
  return axios
    .get(`${process.env.FONT_DATA_BASE_URL}${parameters.font}`)
    .then(({ data }) => {
      fontHashes[parameters.font] = data.family.styles[0].MD5hash
    })
    .then(() => {
      return axios.put(
        `${process.env.BACKEND_URL}/edgecreator/v2/myfontspreview`,
        {
          ...parameters,
          precision: imageWidth / 2,
        },
        {
          headers: req.headers,
        }
      )
    })
    .then(({ data }) => {
      return downloadAndWrite(
        `${process.env.FONT_IMAGE_GEN_URL}?${new URLSearchParams({
          id: fontHashes[parameters.font],
          rbe: 'fixed',
          rt: parameters.texte,
          fg: parameters.color,
          bg: parameters.colorbg,
        }).toString()}`,
        {
          imageId: data.previewid,
          outputPath: `${fontImageDirPath + data.previewid}.png`,
        }
      )
    })
}

const downloadAndWrite = (fileUrl, data) => {
  const writer = fs.createWriteStream(data.outputPath)

  return axios
    .get(fileUrl, {
      responseType: 'stream',
    })
    .then((response) => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer)
        let error = null
        writer.on('error', (err) => {
          error = err
          writer.close()
          reject(err)
        })
        writer.on('close', () => {
          if (!error) {
            resolve({ data })
          }
        })
      })
    })
}
