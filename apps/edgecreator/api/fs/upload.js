import axios from 'axios'
import { addAxiosInterceptor } from '../api'

const fs = require('fs')
const crypto = require('crypto')
const Busboy = require('busboy')

const edgesPath = process.env.EDGES_PATH

addAxiosInterceptor()

export default async function (req, res) {
  if (req.method === 'POST') {
    const userCredentials = {
      'x-dm-user': req.headers.cookie.match(/(?<=dm-user=)[^;]+/)[0],
      'x-dm-pass': req.headers.cookie.match(/(?<=dm-pass=)[^;]+/)[0],
    }

    let isEdgePhoto
    let isMultipleEdgePhoto
    let allowedMimeTypes
    let hash
    let contents

    const fields = {}

    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
      },
    })
    busboy
      .on('field', function (fieldname, val) {
        fields[fieldname] = val
      })
      .on('file', async function (fieldname, file, filename, encoding, mimetype) {
        isEdgePhoto = fields.photo === 'true'
        isMultipleEdgePhoto = fields.multiple === 'true'
        allowedMimeTypes = isEdgePhoto ? ['image/jpg', 'image/jpeg'] : ['image/png']

        const targetFilename = getTargetFilename(filename, isMultipleEdgePhoto)
        try {
          await validateUpload(mimetype, targetFilename, file)
          saveFile(targetFilename)
          await storePhotoHash(targetFilename)
          res.writeHead(200, { Connection: 'close' })
          res.end(
            JSON.stringify({
              filename: targetFilename.replace(process.env.EDGES_PATH, process.env.EDGES_URL),
            })
          )
        } catch (e) {
          res.writeHead(400, { Connection: 'close', 'Content-Type': 'application/json' })
          res.end(e.message)
        }
      })
    req.pipe(busboy)

    const getTargetFilename = (filename, isMultipleEdgePhoto) => {
      filename = filename.normalize('NFD').replace(/[\u0300-\u036F]/g, '')

      if (isMultipleEdgePhoto) {
        return getNextAvailableFile(`${edgesPath}/tranches_multiples/photo.multiple`, 'jpg')
      } else {
        const { country, issuenumber, magazine } = JSON.parse(fields.edge)
        if (isEdgePhoto) {
          return getNextAvailableFile(
            `${edgesPath}/${country}/photos/${magazine}.${issuenumber}.photo`,
            'jpg'
          )
        } else {
          return `${edgesPath}/${country}/elements/${
            filename.includes(magazine) ? filename : `${magazine}.${filename}`
          }`
        }
      }
    }

    const validateUpload = async (mimetype, filename, filestream) => {
      if (!allowedMimeTypes.includes(mimetype)) {
        throw new Error(
          JSON.stringify({
            error: 'error.invalid_file_type',
            placeholders: { mimetype, allowedMimeTypes },
          })
        )
      }
      if (isEdgePhoto) {
        if (await hasReachedDailyUploadLimit()) {
          throw new Error(JSON.stringify({ error: 'error.daily_upload_limit_reached' }))
        }
        if (await hasAlreadySentPhoto(filestream)) {
          throw new Error(JSON.stringify({ error: 'error.photo_already_sent' }))
        }
      } else {
        await readFile(filestream)
        const otherElementUses = isFileExistingAndUsedInOtherModels(filename, fields.edge)
        if (fs.existsSync(filename) && otherElementUses.length) {
          throw new Error(
            JSON.stringify({
              error: 'error.element_is_used_elsewhere',
              placeholders: { otherElementUses: JSON.stringify(otherElementUses) },
            })
          )
        }
      }
    }

    const hasReachedDailyUploadLimit = async () => {
      const uploadedPhotos = await axios.get(
        `${process.env.BACKEND_URL}/edgecreator/multiple_edge_photo/today`,
        { headers: userCredentials }
      )
      return uploadedPhotos.data.length > 10
    }

    const readFile = async (filestream) => {
      const fileReadResults = await readContentsAndCalculateHash(filestream)
      hash = fileReadResults.hash
      contents = fileReadResults.contents
    }

    const hasAlreadySentPhoto = async (filestream) => {
      await readFile(filestream)

      const existingPhoto = await axios.get(
        `${process.env.BACKEND_URL}/edgecreator/multiple_edge_photo/hash/${hash}`,
        { headers: userCredentials }
      )

      return !!existingPhoto.data
    }

    const readContentsAndCalculateHash = async (filestream) =>
      new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha1')
        const chunks = []
        filestream.on('error', (err) => reject(err))
        filestream.on('data', (chunk) => {
          chunks.push(chunk)
          return hash.update(chunk)
        })
        filestream.on('end', () =>
          resolve({
            contents: Buffer.concat(chunks),
            hash: hash.digest('hex'),
          })
        )
      })

    const isFileExistingAndUsedInOtherModels = async (filename, currentModel) => {
      const elementUses = await axios.get(
        `${process.env.BACKEND_URL}/edgecreator/elements/images/${filename}`,
        { headers: userCredentials }
      )
      return elementUses.data.filter(
        (otherUse) =>
          currentModel.country !== otherUse.pays ||
          currentModel.magazine !== otherUse.magazine ||
          currentModel.issuenumber !== otherUse.numero
      ).length
    }

    const saveFile = (filename) => {
      fs.mkdirSync(require('path').dirname(filename), { recursive: true })
      const writer = fs.createWriteStream(filename)
      writer.write(contents)
      writer.end()
    }

    const storePhotoHash = async (filename) => {
      await axios.put(
        `${process.env.BACKEND_URL}/edgecreator/multiple_edge_photo`,
        { filename, hash },
        { headers: userCredentials }
      )
    }
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
