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

const io = IO(server, {
  cors: {
    origin: process.env.NUXT_URL,
    methods: ['GET'],
  },
})

prisma.games
  .findMany({
    include: {
      rounds: {
        where: { finished_at: null },
      },
    },
    where: {
      finished_at: { not: null },
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
  socket.on('iAmReady', async ({ username, id }) => {
    console.log(`${username} is ready`)
    const gameData = await game.createOrGetPending()
    console.log(gameData)
    const eventBack = {
      gameId: gameData.gameId,
      userId: id,
      username,
    }
    socket.emit('iAmReadyWithGameID', eventBack)
  })
  socket.on('whoElseIsReady', ({ username, gameId }) => {
    console.log(`${username} wants to know who else is in game ID ${gameId}`)
    socket.broadcast.emit('whoElseIsReady', { username, gameId })
  })
  socket.on('iAmAlsoReady', ({ username, gameId }) => {
    console.log(`${username} is also ready in game ID ${gameId}`)
    socket.broadcast.emit('iAmAlsoReady', { username, gameId })
  })
  socket.on('matchStarts', async ({ gameId }) => {
    console.log(`Game ${gameId} is starting!`)
    const currentGame = await prisma.games.findUnique({
      include: {
        rounds: {
          where: { finished_at: null },
        },
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

server.listen(4000, () => {
  console.log('listening on *:4000')
})
