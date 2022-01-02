const axios = require('axios')
const tf = require('@tensorflow/tfjs')
const tfn = require('@tensorflow/tfjs-node')
const sharp = require('sharp')

const modelFile = tfn.io.fileSystem('models/us/model.json')

const artists = ['CB', 'AT', 'TS', 'FG', 'DR', 'PM', 'JB', 'AH', 'PAl', 'WVH']

let model

tf.loadLayersModel(modelFile).then((loadedModel) => {
  model = loadedModel
})

exports.playAsBot = (botUsername, socket, rounds) => {
  const predicted = []
  const predictionInterval = setInterval(() => {
    const now = new Date()
    const currentRound = rounds.find(
      ({ started_at: startedAt, finished_at: finishedAt }) =>
        startedAt <= now && now < finishedAt
    )
    if (currentRound && !predicted.includes(currentRound.round_number)) {
      console.log('We are now at round ' + currentRound.round_number)
      const possibleAuthors = rounds
        .filter(
          ({ round_number: roundNumber }) =>
            roundNumber >= currentRound.round_number
        )
        .map(({ personcode }) => personcode)
      exports
        .predict(
          currentRound.round_number,
          currentRound.entryurl_url,
          possibleAuthors
        )
        .then((personcode) => {
          socket.emit('guess', { username: botUsername }, currentRound.id, {
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

exports.predict = (roundNumber, url, possibleAuthors) =>
  new Promise((resolve) => {
    console.log('Possible authors: ' + JSON.stringify(possibleAuthors))
    const startTime = new Date().getTime()
    axios({
      url: `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${url}`,
      responseType: 'arraybuffer',
    }).then(({ data: input }) =>
      sharp(input)
        .resize(224, 224)
        .toBuffer()
        .then((data) => {
          let image = tfn.node.decodeImage(data, 0)
          image = tf.expandDims(image, 0)
          image = tf.cast(image, 'float32').div(255)
          const prediction = model.predict(image)
          prediction.array().then(([predictionArray]) => {
            console.log(
              `Prediction done in ${new Date().getTime() - startTime}ms`
            )
            const sortedPredictions = predictionArray
              .map((predictionProbability, predictionIndex) => ({
                personcode: artists[predictionIndex],
                predictionProbability: predictionProbability * 100,
              }))
              .sort(
                (
                  { predictionProbability: predictionProbability1 },
                  { predictionProbability: predictionProbability2 }
                ) => (predictionProbability2 > predictionProbability1 ? 1 : -1)
              )
            for (const {
              personcode,
              predictionProbability,
            } of sortedPredictions) {
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
              possibleAuthors[
                Math.floor(Math.random() * possibleAuthors.length)
              ]
            resolve(randomElement)
          })
        })
    )
  })
