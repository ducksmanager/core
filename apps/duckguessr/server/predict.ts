import * as fs from 'fs'
import { LayersModel, Tensor } from '@tensorflow/tfjs-node'
import Index from '@prisma/client'

const axios = require('axios')
const tf = require('@tensorflow/tfjs')
const tfn = require('@tensorflow/tfjs-node')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

interface ModelWithArtist {
  model: LayersModel
  artists: Array<string>
}

const models: { [key: string]: ModelWithArtist } = {}

prisma.dataset
  .findMany({
    where: {
      name: { endsWith: '-ml' },
    },
  })
  .then(async (mlDatasets: Array<Index.dataset>) => {
    for (const { id, name } of mlDatasets) {
      const artists = await prisma.$queryRaw`
        select distinct personcode
        from dataset_entryurl
        left join entryurl_details using (sitecode_url)
        where dataset_id = ${id}
      `
      const modelScopeName = name.replace(/-ml$/, '')
      const modelFilePath = `datasets/${modelScopeName}/model/model.json`
      if (fs.existsSync(modelFilePath)) {
        const modelFile = tfn.io.fileSystem(modelFilePath)
        models[modelScopeName] = {
          artists,
          model: await tf.loadLayersModel(modelFile),
        }
      } else {
        console.error(`There is no ML model at path ${modelFilePath}`)
      }
    }
  })

export const predict = (
  roundNumber: number,
  url: string,
  dataset: Index.dataset,
  possibleAuthors: string[]
) =>
  new Promise((resolve) => {
    console.log('Possible authors: ' + JSON.stringify(possibleAuthors))
    const startTime = new Date().getTime()
    axios({
      url: `${process.env.CLOUDINARY_URL_ROOT}${url}`,
      responseType: 'arraybuffer',
    }).then(({ data: input }: { data: Uint8Array }) => {
      const buffer = tfn.node.decodeImage(input, 3)
      let image = buffer.resizeBilinear([224, 224]).div(tf.scalar(255))
      image = tf.expandDims(image, 0)
      image = tf.cast(image, 'float32').div(255)

      const prediction = models[dataset.name].model.predict(image) as Tensor
      prediction.array().then(([predictionArray]: any) => {
        console.log(`Prediction done in ${new Date().getTime() - startTime}ms`)
        const sortedPredictions = predictionArray
          .map((probability: number, predictionIndex: number) => ({
            artist: models[dataset.name].artists[predictionIndex],
            probability: probability * 100,
          }))
          .sort(
            (
              { probability: probability1 }: { probability: number },
              { probability: probability2 }: { probability: number }
            ) => (probability2 > probability1 ? 1 : -1)
          )
        for (const {
          artist: { personcode },
          probability,
        } of sortedPredictions) {
          console.log(
            `Round ${roundNumber} - Predicted artist = ${personcode}, probability of ${probability}%`
          )
          if (!possibleAuthors.includes(personcode)) {
            console.log('Skipped')
          } else {
            resolve(personcode)
            return
          }
        }
        console.error(
          'No possible authors match the prediction, choosing a random author'
        )
        const randomElement =
          possibleAuthors[Math.floor(Math.random() * possibleAuthors.length)]
        resolve(randomElement)
      })
    })
  })
