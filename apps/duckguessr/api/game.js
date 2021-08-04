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
            rounds: {
              include: {
                round_scores: {
                  include: {
                    players: {
                      select: {
                        username: true,
                      },
                    },
                  },
                },
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
            'personrole',
          ]
          res.writeHeader(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              ...game,
              authors: game.rounds.map((round) =>
                authorFields.reduce(
                  (author, field) => ({
                    ...author,
                    [field]: round[field],
                  }),
                  {}
                )
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
