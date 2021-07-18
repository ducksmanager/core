const http = require('http')
require('dotenv').config({ path: '../.env' })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const server = http.createServer(app)
const IO = require('socket.io')

const { addAxiosInterceptor } = require('../api/axiosApiInterceptor')
const game = require('./game')

const io = IO(server, {
  cors: {
    origin: process.env.NUXT_URL,
    methods: ['GET'],
  },
})

addAxiosInterceptor()

prisma.games
  .findMany({
    include: {
      rounds: {
        where: { finished_at: null },
      },
    },
    where: {
      finished_at: null,
    },
  })
  .then((pendingGames) => {
    for (const game of pendingGames) {
      console.debug(`Creating socket for unfinished game with ID ${game.id}`)
      game.createSocket(io, game)
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
    if ([...io._nsps.keys()].includes(`/game/${gameId}`)) {
      return
    }
    const game = await prisma.games.findUnique({
      include: {
        rounds: {
          where: { finished_at: false },
        },
      },
      where: {
        game_id: gameId,
      },
    })
    game.createSocket(io, game)
  })
})

server.listen(4000, () => {
  console.log('listening on *:4000')
})
