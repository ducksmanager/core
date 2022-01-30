const request = require('request').defaults({ encoding: null })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
  const round = await getStartedRound(gameId, false)
  switch (req.method) {
    case 'GET':
      switch (action) {
        case undefined: {
          if (!round) {
            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                round_scores: prisma.round_score.findMany({
                  where: {
                    game_id: gameId,
                  },
                }),
              })
            )
            return
          }
          const cloudinaryUrl = `${process.env.CLOUDINARY_URL_ROOT}${round.sitecode_url}`
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
