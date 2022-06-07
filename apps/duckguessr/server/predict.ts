import Index from '@prisma/client'

const axios = require('axios')

interface PredictionResponse {
  url: string
  predicted: string
  predictionProbability: string
}

export const predict = (round: Index.round, dataset: Index.dataset, possibleAuthors: string[]) =>
  new Promise((resolve) => {
    console.log('Possible authors: ' + JSON.stringify(possibleAuthors))
    const startTime = new Date().getTime()
    axios
      .post(process.env.BOT_URL, {
        url: round.sitecode_url,
        dataset: dataset.name,
      })
      .then(({ data: { predicted, predictionProbability } }: { data: PredictionResponse }) => {
        console.log(`Prediction done in ${new Date().getTime() - startTime}ms`)
        console.log(
          `Round ${round.round_number} - Predicted artist = ${predicted},
            probability of ${predictionProbability}%`
        )
        if (!possibleAuthors.includes(predicted)) {
          console.log('Skipped')
        } else {
          resolve(predicted)
          return
        }
        console.error('No possible authors match the prediction, choosing a random author')
        const randomElement = possibleAuthors[Math.floor(Math.random() * possibleAuthors.length)]
        resolve(randomElement)
      })
      .catch((error: any) => {
        console.error(error?.response?.data || 'Bot server seems to be offline')
        console.log('Prediction failed, choosing a random author')
        const randomElement = possibleAuthors[Math.floor(Math.random() * possibleAuthors.length)]
        resolve(randomElement)
      })
  })
