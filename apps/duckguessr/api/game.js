const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default (req, res) => {
  switch (req.method) {
    case 'GET': {
      const gameIdMatch = req.url.match(/^\/([0-9]+)/)
      if (!gameIdMatch || !gameIdMatch[1]) {
        res.statusCode = 400
        res.end()
        return
      }
      const gameId = parseInt(gameIdMatch[1])
      prisma.games
        .findFirst({
          include: {
            game_players: {
              include: {
                players: true,
              },
            },
            rounds: {
              include: {
                round_scores: true,
              },
            },
          },
          where: {
            id: gameId,
          },
        })
        .then((game) => {
          if (!game) {
            res.statusCode = 400
            res.end()
            return
          }
          const authorFields = [
            'personcode',
            'personnationality',
            'personfullname',
          ]
          res.writeHeader(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              ...game,
              rounds: game.rounds.map((round) => ({
                ...round,
                ...Object.keys(round)
                  .filter((key) => key.indexOf('person') === 0)
                  .reduce(
                    (acc, field) => ({
                      ...acc,
                      [field]:
                        round.finished_at && round.finished_at <= Date.now()
                          ? round[field]
                          : null,
                    }),
                    {}
                  ),
              })),
              authors: game.rounds
                .map((round) =>
                  authorFields.reduce(
                    (author, field) => ({
                      ...author,
                      [field]: round[field],
                    }),
                    {}
                  )
                )
                .sort(
                  ({ personcode: personcode1 }, { personcode: personcode2 }) =>
                    personcode1 < personcode2 ? -1 : 1
                ),
            })
          )
        })
        .catch((e) => {
          throw e
        })

        .finally(async () => {
          await prisma.$disconnect()
        })
    }
  }
}
