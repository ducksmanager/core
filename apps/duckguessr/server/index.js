const http = require('http')
require('dotenv').config({ path: '../.env' })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const server = http.createServer(app)
const IO = require('socket.io')

const game = require('./game')
const round = require('./round')

global.cachedUsers = {}

const io = IO(server, {
  cors: {
    origin: process.env.NUXT_URL,
    methods: ['GET'],
  },
})

prisma.games
  .findMany({
    where: {
      rounds: {
        some: {
          finished_at: { gt: new Date() },
        },
      },
    },
  })
  .then((pendingGames) => {
    for (const pendingGame of pendingGames) {
      console.debug(
        `Creating socket for unfinished game with ID ${pendingGame.id}`
      )
      game.createSocket(io, pendingGame)
    }
  })

io.of('/matchmaking').on('connection', (socket) => {
  console.log('a user connected')
  socket.on('iAmReady', async ({ username }) => {
    console.log(`${username} is ready`)
    const gameData = await game.createOrGetPending()
    const user = await game.associatePlayer(gameData.gameId, username)

    socket.emit('iAmReadyWithGameID', {
      gameId: gameData.gameId,
      ...user,
    })
  })
  socket.on('whoElseIsReady', ({ username, gameId }) => {
    console.log(`${username} wants to know who else is in game ID ${gameId}`)
    socket.broadcast.emit('whoElseIsReady', { username, gameId })
  })
  socket.on('iAmAlsoReady', async ({ username, gameId }) => {
    console.log(`${username} is also ready in game ID ${gameId}`)
    await game.associatePlayer(gameId, username)

    socket.broadcast.emit('iAmAlsoReady', { username, gameId })
  })
  socket.on('matchStarts', async ({ gameId }) => {
    console.log(`Game ${gameId} is starting!`)
    const currentGame = await prisma.games.findUnique({
      include: {
        rounds: true,
      },
      where: {
        id: gameId,
      },
    })
    if (!currentGame.rounds[0].started_at) {
      await round.createGameRounds(currentGame.id)
    }
    game.createSocket(io, currentGame)
  })
})

io.of('/admin/maintenance').on('connection', (socket) => {
  socket.on('get', async () => {
    let entryurlsToMaintain = []
    let minRow = 0
    const batch = 60
    let alreadyVerifiedCoaEntryUrls = null
    while (
      entryurlsToMaintain.length < batch &&
      (alreadyVerifiedCoaEntryUrls == null ||
        alreadyVerifiedCoaEntryUrls.length)
    ) {
      const coaEntryUrls = (
        await game.runCoaQuery(game.getCOAEntryurlsQuery([minRow, batch]))
      ).data.map(({ sitecode_url: sitecodeUrl }) => sitecodeUrl)
      alreadyVerifiedCoaEntryUrls = (
        await prisma.entryurl_validations.findMany({
          where: {
            sitecode_url: {
              in: coaEntryUrls,
            },
          },
        })
      ).map(({ sitecode_url: sitecodeUrl }) => sitecodeUrl)
      entryurlsToMaintain = [
        ...entryurlsToMaintain,
        ...coaEntryUrls.filter((x) => !alreadyVerifiedCoaEntryUrls.includes(x)),
      ]
      minRow += batch
    }
    socket.emit(
      'entryurlsPendingMaintenance',
      entryurlsToMaintain.map((sitecodeUrl) => ({ sitecodeUrl }))
    )
  })

  socket.on(
    'postValidationsChoices',
    async ({ entryurlsPendingMaintenance, invalidSitecodeUrls }) => {
      await prisma.entryurl_validations.createMany({
        data: entryurlsPendingMaintenance.map(({ sitecodeUrl }) => ({
          sitecode_url: sitecodeUrl,
          decision: invalidSitecodeUrls.includes(sitecodeUrl),
          updated_at: new Date(),
        })),
      })
    }
  )
})

server.listen(4000, () => {
  console.log('listening on *:4000')
})
