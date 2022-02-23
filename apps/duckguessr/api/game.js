const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { createPool } = require('mariadb')

let coaPool

export default async (req, res) => {
  switch (req.method) {
    case 'GET': {
      const gameIdMatch = req.url.match(/^\/([0-9]+)/)
      if (!gameIdMatch || !gameIdMatch[1]) {
        res.statusCode = 400
        res.end()
        return
      }
      const gameId = parseInt(gameIdMatch[1])
      const game = await prisma.game.findFirst({
        include: {
          game_players: {
            include: {
              player: true,
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
      if (!game) {
        res.statusCode = 400
        res.end()
        return
      }

      if (!coaPool) {
        coaPool = createPool({
          host: process.env.MYSQL_COA_HOST,
          user: 'root',
          database: 'coa',
          password: process.env.MYSQL_ROOT_PASSWORD,
          connectionLimit: 5,
        })
      }
      const coaConnection = await coaPool.getConnection()
      const [personDetails] = await coaConnection.query(
        `
          SELECT personcode, fullname AS personfullname, nationalitycountrycode AS personnationality
          FROM inducks_person
          WHERE personcode IN (${game.rounds.map(() => '?').join(',')}
        `,
        game.rounds.map(({ personcode }) => personcode)
      )
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          ...game,
          rounds: game.rounds
            .filter(({ round_number }) => round_number !== null)
            .map((round) => ({
              ...round,
              ...Object.keys(round)
                .filter((key) => key === 'personcode')
                .reduce(
                  (acc, field) => ({
                    ...acc,
                    [field]:
                      round.finished_at && round.finished_at <= Date.now() ? round[field] : null,
                  }),
                  {}
                ),
            })),
          authors: personDetails.sort(({ personcode: personcode1 }, { personcode: personcode2 }) =>
            personcode1 < personcode2 ? -1 : 1
          ),
        })
      )

      await prisma.$disconnect()
      if (!game) {
        res.statusCode = 404
        res.end()
      }
    }
  }
}
