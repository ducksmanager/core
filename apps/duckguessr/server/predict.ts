import { LayersModel, Tensor } from '@tensorflow/tfjs-node'
import Index from '@prisma/client'
import { Socket } from 'socket.io'

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
      const modelFile = tfn.io.fileSystem(`models/${name}/model.json`)
      models[name] = {
        artists,
        model: await tf.loadLayersModel(modelFile),
      }
    }
  })

export function playAsBot(
  botUsername: string,
  socket: Socket,
  dataset: Index.dataset,
  rounds: Index.round[]
) {
  const predicted: number[] = []
  const predictionInterval = setInterval(() => {
    const now = new Date()
    const currentRound = rounds.find(
      ({ started_at: startedAt, finished_at: finishedAt }) =>
        startedAt!! <= now && now < finishedAt!!
    )
    if (currentRound && !predicted.includes(currentRound.round_number)) {
      console.log('We are now at round ' + currentRound.round_number)
      const possibleAuthors = rounds
        .filter(
          ({ round_number: roundNumber }) =>
            roundNumber >= currentRound.round_number
        )
        .map(({ personcode }) => personcode)
      predict(
        currentRound.round_number,
        currentRound.sitecode_url,
        dataset,
        possibleAuthors
      ).then((personcode) => {
        socket.emit('guess', botUsername, currentRound.id, {
          personcode,
        })
      })
      predicted.push(currentRound.round_number)
      if (predicted.length === rounds.length) {
        clearInterval(predictionInterval)
      }
    } else {
      console.log('No round currently')
    }
  }, 1000)
}

const predict = (
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
          .map((predictionProbability: number, predictionIndex: number) => ({
            personcode: models[dataset.name].artists[predictionIndex],
            predictionProbability: predictionProbability * 100,
          }))
          .sort(
            (
              {
                predictionProbability: predictionProbability1,
              }: { predictionProbability: number },
              {
                predictionProbability: predictionProbability2,
              }: { predictionProbability: number }
            ) => (predictionProbability2 > predictionProbability1 ? 1 : -1)
          )
        for (const { personcode, predictionProbability } of sortedPredictions) {
          console.log(
            `Round ${roundNumber} - Predicted artist = ${personcode}, probability of ${predictionProbability}%`
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
