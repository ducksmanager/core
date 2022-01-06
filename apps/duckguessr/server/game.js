const axios = require('axios')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const numberOfRounds = 8

exports.createOrGetPending = async (gameType) => {
  const pendingGame = await prisma.games.findFirst({
    include: {
      game_players: true,
    },
    where: {
      game_type: gameType,
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
    const rounds = roundDataResponse
      .map((roundData, roundNumber) => ({
        ...roundData,
        round_number: roundNumber + 1,
        entryurl_id: parseInt(roundData.entryurl_id),
      }))
      .filter(({ round_number: roundNumber }) => roundNumber <= numberOfRounds)
    const game = await prisma.games.create({
      data: {
        game_type: gameType,
        rounds: {
          create: rounds,
        },
      },
    })

    return { gameId: game.id, created: true }
  }
}

exports.associatePlayer = async (gameId, username, password) => {
  let user
  if (/^user[0-9]+$/.test(username) || /^bot_.+$/.test(username)) {
    user = await prisma.players.findFirst({
      where: {
        username,
      },
    })
    if (!user) {
      user = await prisma.players.create({
        data: {
          username,
        },
      })
    }
  } else {
    const users = (
      await this.runQuery(
        'SELECT ID AS id, username from users where username=? AND password=?',
        'dm',
        [username, password]
      )
    ).data
    user = users[0]
    if (!user) {
      console.error(`No user with username ${username}`)
      return null
    }
  }
  const userId = user.id
  global.cachedUsers[userId] = user
  await prisma.game_players.create({
    data: {
      game_id: gameId,
      player_id: userId,
    },
  })

  return user
}

const getCOARoundsQuery = (dataset) =>
  fs.existsSync(`datasets/${dataset}/game.sql`)
    ? fs
        .readFileSync(`datasets/${dataset}/game.sql`)
        .toString()
        .replace('@numberOfRounds_plus_1', '' + (numberOfRounds + 1))
    : null

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
