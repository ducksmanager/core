import { runQuery } from './runQuery'

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
          runQuery(
            `
              SELECT personcode, fullname AS personfullname, nationalitycountrycode AS personnationality
              FROM coa.inducks_person
              WHERE personcode IN ('${game.rounds
                .map(({ personcode }) => personcode)
                .join("', '")}')`,
            'coa'
          ).then(({ data: personDetails }) => {
            res.writeHeader(200, { 'Content-Type': 'application/json' })
            res.end(
              JSON.stringify({
                ...game,
                rounds: game.rounds.map((round) => ({
                  ...round,
                  ...Object.keys(round)
                    .filter((key) => key === 'personcode')
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
                authors: personDetails.sort(
                  ({ personcode: personcode1 }, { personcode: personcode2 }) =>
                    personcode1 < personcode2 ? -1 : 1
                ),
              })
            )
          })
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
