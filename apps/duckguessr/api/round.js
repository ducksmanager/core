import { addAxiosInterceptor } from './axiosApiInterceptor'

const request = require('request').defaults({ encoding: null })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

addAxiosInterceptor()

const playerId = 1
const numberOfRounds = 10

async function getStartedRound(gameId, finished) {
  return await prisma.rounds.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      game_id: parseInt(gameId),
      started_at: { not: null },
      finished_at: finished ? { not: null } : null,
    },
    orderBy: {
      round_number: finished ? 'desc' : 'asc',
    },
  })
}

export default async (req, res) => {
  const [, gameId, action] = req.url.split('/')
  if (!gameId) {
    res.statusCode = 400
    res.end()
    return
  }
  let round = await getStartedRound(gameId, false)
  switch (req.method) {
    case 'POST': {
      switch (action) {
        case 'start':
          if (!round) {
            round = await prisma.rounds.update({
              data: {
                started_at: new Date().toISOString().replace(/[TZ]/g, ' '),
              },
              where: {
                game_id: parseInt(gameId),
                orderBy: {
                  round_number: 'desc',
                },
                take: 1,
              },
            })
          }
          res.writeHeader(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ round }))
          break
        case 'finish':
          {
            let finishedRound
            if (round) {
              finishedRound = await prisma.rounds.update({
                include: {
                  round_scores: true,
                },
                data: {
                  finished_at: new Date(),
                },
                where: {
                  id: round.id,
                },
              })
              if (finishedRound.round_number === numberOfRounds - 1) {
                await prisma.games.update({
                  data: {
                    finished_at: new Date(),
                  },
                  where: {
                    id: round.game_id,
                  },
                })
              }
            }
            round = finishedRound || (await getStartedRound(gameId, true))
            const { round_scores: roundScores } = round
            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                roundScores,
              })
            )
          }
          break
        case 'guess': {
          const { guess } = req.body
          const scores = []
          if (guess == null) {
            res.statusCode = 400
            res.end(`No guess was provided`)
            return
          }
          if (
            await prisma.round_scores.findFirst({
              where: {
                player_id: playerId,
                round_id: round.id,
              },
            })
          ) {
            res.statusCode = 400
            res.end(`Player ${playerId} already guessed round ${round.id}`)
            return
          }

          scores.push({
            score_type_name: 'Correct author',
            score: guess.personcode === round.personcode ? 350 : 0,
          })
          scores.push({
            score_type_name: 'Correct nationality',
            score:
              guess.personnationality === round.personnationality ? 150 : 0,
          })

          console.log(
            `${guess.firstpublicationyear} vs ${round.firstpublicationyear}`
          )
          const closeDatePoints = Math.max(
            0,
            500 -
              Math.pow(
                guess.firstpublicationyear - round.firstpublicationyear,
                2.5
              )
          )
          scores.push({
            score_type_name: 'Close date',
            score: closeDatePoints,
          })

          await prisma.round_scores.createMany({
            data: scores.map((score) => ({
              ...score,
              player_id: playerId,
              round_id: round.id,
            })),
          })

          res.writeHeader(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ scores }))
          break
        }
      }
      break
    }
    case 'GET':
      switch (action) {
        case undefined: {
          if (!round) {
            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                round_scores: prisma.round_scores.findMany({
                  where: {
                    game_id: gameId,
                  },
                }),
              })
            )
            return
          }
          const cloudinaryUrl = `https://res.cloudinary.com/dl7hskxab/image/upload/v1623338718/inducks-covers/${round.entryurl_url}`
          request.get(cloudinaryUrl, function (error, response, body) {
            if (!error && response.statusCode === 200) {
              try {
                const buffer = Buffer.from(body)
                const base64 = `data:${
                  response.headers['content-type']
                };base64,${buffer.toString('base64')}`
                res.writeHeader(200, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    gameId,
                    roundNumber: round.round_number,
                    base64,
                  })
                )
              } catch (e) {
                res.statusCode = 404
                res.end()
              }
            } else {
              res.statusCode = response.statusCode
              res.end()
            }
          })
        }
      }
      break
  }
}
