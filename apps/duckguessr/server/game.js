const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const round = require('./round')

const prisma = new PrismaClient()
const numberOfRounds = 8

exports.createOrGetPending = async () => {
  const pendingGame = await prisma.games.findFirst({
    include: {
      game_players: true,
    },
    where: {
      started_at: null,
    },
  })
  if (pendingGame) {
    return { gameId: pendingGame.id, created: false }
  }

  const maxAttempts = 5
  let roundDataResponse = []
  let attempts = 0
  do {
    roundDataResponse = (await generateRoundsFromCOA()).data
  } while (
    roundDataResponse.length < numberOfRounds + 1 &&
    ++attempts < maxAttempts
  )

  if (attempts === maxAttempts) {
    throw new Error(
      "Couldn't generate rounds, not enough matches from COA query results"
    )
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

    return { gameId: game.gameId, created: true }
  }
}

exports.onGameConnection = (socket) => {
  const gameId = socket.id.split('/').slice(-1)
  socket.on('guess', async ({ username, guess }) => {
    console.log(`${username} is guessing ${guess}`)
    const user = prisma.players.findFirst({
      where: { username },
    })
    const guessResultsData = await round.guess(user.username, gameId, guess)
    socket.broadcast.emit('playerGuessed', { username, guessResultsData })
    socket.emit('iGuessed', { guessResultsData })
  })
}

exports.createSocket = (io, game) => {
  io.of(`/game/${game.id}`).on('connection', (socket) => {
    console.log(game.rounds)
    // socket.broadcast.emit()
    exports.onGameConnection(socket)
  })
}

const generateRoundsFromCOA = async () => {
  axios.interceptors.request.use((config) => ({
    ...config,
    auth: {
      username: process.env.RAWSQL_USER,
      password: process.env.RAWSQL_PASS,
    },
    headers: {
      ...config.headers,
      'x-dm-version': '1.0.0',
      'Content-Type': 'application/json',
    },
  }))
  return await axios
    .post(`${process.env.BACKEND_URL}/rawsql`, {
      query: `
        select distinct id                            as entryurl_id,
                        concat(sitecode, '/', url)    as entryurl_url,
                        person.personcode,
                        person.nationalitycountrycode as personnationality,
                        person.fullname               as personfullname
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
        order by RAND()
        limit ${numberOfRounds + 1}
      `,
      db: 'coa',
    })
    .catch((e) => {
      console.error(e)
      throw e
    })
}
