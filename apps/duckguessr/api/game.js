import axios from 'axios'
import { addAxiosInterceptor } from './axiosApiInterceptor'

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

addAxiosInterceptor()

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
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
              rounds: true,
            },
            where: {
              id: gameId,
            },
          })
          .then((game) => {
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
                rounds: null,
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
      const numberOfRounds = 10
      const response = await axios
        .request({
          method: 'POST',
          url: `${process.env.BACKEND_URL}/rawsql`,
          data: {
            query: `
              select distinct id as entryurl_id,
                              concat(sitecode, '/', url) as entryurl_url,
                              person.personcode,
                              person.nationalitycountrycode as personnationality,
                              person.fullname as personfullname,
                              plotwritartink as personrole,
                              regexp_replace(firstpublicationdate, '-.*', '') as firstpublicationyear
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
              group by url
              limit 10
            `,
            db: 'coa',
          },
          headers: req.headers,
        })
        .catch((e) => {
          console.error(e)
          res.statusCode = e.response.status
          res.end()
          throw e
        })

      if (response) {
        const { id: gameId } = await prisma.games.create({
          data: {
            rounds: {
              create: [...Array(numberOfRounds).keys()].map((roundNumber) => ({
                ...response.data[roundNumber],
                round_number: roundNumber,
                entryurl_id: parseInt(response.data[roundNumber].entryurl_id),
                firstpublicationyear: parseInt(
                  response.data[roundNumber].firstpublicationyear
                ),
              })),
            },
          },
        })

        res.writeHeader(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ gameId }))
      }
    }
  }
}
