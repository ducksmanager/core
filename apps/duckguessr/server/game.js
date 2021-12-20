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
      rounds: {
        some: {
          started_at: null,
          round_number: 0,
        },
      },
    },
  })
  if (pendingGame) {
    return { gameId: pendingGame.id, created: false }
  }

  const maxAttempts = 5
  let roundDataResponse = []
  let attempts = 0
  do {
    roundDataResponse = (await this.runQuery(getCOARoundsQuery(), 'coa')).data
    const invalidEntryurls = await prisma.entryurl_validations.findMany({
      where: {
        sitecode_url: {
          in: roundDataResponse.map(({ entryurl_url: entryUrl }) => entryUrl),
        },
        decision: true,
      },
    })
    roundDataResponse = roundDataResponse.filter(
      ({ entryurl_url: entryUrl }) => !invalidEntryurls.includes(entryUrl)
    )
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

    return { gameId: game.id, created: true }
  }
}

exports.associatePlayer = async (gameId, username, password) => {
  const users = (
    await this.runQuery(
      'SELECT ID, username from users where username=? AND password=?',
      'dm',
      [username, password]
    )
  ).data
  const user = users[0]
  if (!user) {
    console.error(`No user with username ${username}`)
    return null
  }
  const userId = user.ID
  global.cachedUsers[userId] = user
  prisma.game_players.create({
    game_id: gameId,
    player_id: userId,
  })

  return user
}

exports.onGameConnection = (socket) => {
  socket.on('guess', async ({ username }, roundId, guess) => {
    console.log(
      `${username} is guessing ${JSON.stringify(guess)} on round ${roundId}`
    )
    try {
      const guessResultsData = await round.guess(
        Object.values(global.cachedUsers).find(
          ({ username: cachedUsername }) => cachedUsername === username
        ).id,
        roundId,
        guess
      )
      socket.broadcast.emit('playerGuessed', guessResultsData)
      socket.emit('playerGuessed', guessResultsData)
    } catch (e) {
      console.error(e)
    }
  })
}

exports.createSocket = (io, game) => {
  io.of(`/game/${game.id}`).on('connection', (socket) => {
    exports.onGameConnection(socket)
  })
}

exports.getCOAEntryurlsQuery = (limits) => `
  select concat(sitecode, '/', url) as sitecode_url
  from inducks_entryurl
  where sitecode = 'thumbnails3'
  limit ${limits.join(',')}
`

const getCOARoundsQuery = () => `
  select distinct id                            as entryurl_id,
                  concat(sitecode, '/', url)    as entryurl_url,
                  person.personcode,
                  person.nationalitycountrycode as personnationality,
                  person.fullname               as personfullname
  from (
         SELECT entrycode, url, sitecode, id
         FROM inducks_entryurl
         WHERE id >= FLOOR(RAND() * (SELECT MAX(id) FROM inducks_entryurl))
           AND sitecode = 'thumbnails3'
         ORDER BY RAND()
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
`

exports.runQuery = async (query, db, parameters = []) => {
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
      query,
      db,
      parameters,
    })
    .catch((e) => {
      console.error(e)
      throw e
    })
}
