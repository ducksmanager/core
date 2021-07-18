import axios from 'axios'
import { addAxiosInterceptor } from './axiosApiInterceptor'

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const numberOfRounds = 8

addAxiosInterceptor()

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function generateRoundsFromCOA(res) {
  return await axios
    .post(`${process.env.BACKEND_URL}/rawsql`, {
      query: `
        select distinct id                            as entryurl_id,
                        concat(sitecode, '/', url)    as entryurl_url,
                        person.personcode,
                        person.nationalitycountrycode as personnationality,
                        person.fullname               as personfullname,
                        plotwritartink                as personrole
        from (
               SELECT entrycode, url, sitecode, storycode, id
               FROM inducks_entryurl
               WHERE id >= FLOOR(RAND() * (SELECT MAX(id) FROM inducks_entryurl))
                 AND sitecode = 'thumbnails3'
               LIMIT 150
             ) as entryurl
               inner join inducks_entry entry on entry.entrycode = entryurl.entrycode
               inner join inducks_storyversion storyversion
                          on entry.storyversioncode = storyversion.storyversioncode
               inner join inducks_story story on storyversion.storycode = story.storycode
               inner join inducks_storyjob storyjob on storyversion.storyversioncode = storyjob.storyversioncode
               inner join inducks_person person on storyjob.personcode = person.personcode
        where position like 'p%'
          and person.personcode <> '?'
          and person.nationalitycountrycode <> ''
          and storyjob.plotwritartink = 'a'
        group by person.personcode
        limit ${numberOfRounds + 1}
      `,
      db: 'coa',
    })
    .catch((e) => {
      console.error(e)
      res.statusCode = e.response.status
      res.end()
      throw e
    })
}

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      {
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
                authors: shuffleArray(
                  game.rounds.map((round) =>
                    authorFields.reduce(
                      (author, field) => ({
                        ...author,
                        [field]: round[field],
                      }),
                      {}
                    )
                  )
                ),
                rounds: game.rounds.filter(
                  ({ finished_at: finishedAt }) => !!finishedAt
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
      break
    case 'PUT': {
      const pendingGame = await prisma.games.findFirst({
        include: {
          game_players: true,
        },
        where: {
          started_at: null,
        },
      })
      if (pendingGame) {
        res.writeHeader(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ gameId: pendingGame.id, created: false }))
        return
      }

      let roundDataResponse = []
      let attempts = 0
      do {
        roundDataResponse = (await generateRoundsFromCOA(res)).data
      } while (roundDataResponse.length < numberOfRounds + 1 && ++attempts < 5)

      if (attempts === 5) {
        res.writeHeader(500, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            message:
              "Couldn't generate rounds, not enough matches from COA query results",
          })
        )
        return
      }

      if (roundDataResponse) {
        const game = await prisma.games.create({
          data: {
            rounds: {
              create: roundDataResponse.map((roundData, roundNumber) => ({
                ...roundData,
                round_number: roundNumber,
                entryurl_id: parseInt(roundData.entryurl_id),
              })),
            },
          },
        })

        console.log(game)

        res.writeHeader(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ gameId: game.gameId, created: true }))
      }
    }
  }
}
