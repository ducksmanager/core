const http = require('http')
const axios = require('axios')
require('dotenv').config({ path: '../.env' })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const server = http.createServer(app)
const IO = require('socket.io')
const io = IO(server, {
  cors: {
    origin: process.env.NUXT_URL,
    methods: ['GET', 'POST'],
  },
})

const onGameConnection = (socket) => {
  const gameId = socket.id.split('/').slice(-1)
  socket.on('guess', async ({ username, guess }) => {
    console.log(`${username} is guessing ${guess}`)
    const { data: guessResultsData } = await axios.request({
      method: 'POST',
      url: `${process.env.NUXT_URL}/api/round/${gameId}/guess`,
      data: guess,
    })
    socket.broadcast.emit('playerGuessed', { username, guessResultsData })
    socket.emit('iGuessed', { guessResultsData })
  })
}

prisma.games
  .findMany({
    where: {
      started_at: null,
    },
  })
  .then((pendingGames) => {
    for (const { gameId } of pendingGames) {
      io.of(`/game/${gameId}`).on('connection', onGameConnection)
    }
  })

io.of('/matchmaking').on('connection', (socket) => {
  console.log('a user connected')
  socket.on('iAmReady', async ({ username, id }) => {
    console.log(`${username} is ready`)
    const { data: createdGameData } = await axios.request({
      method: 'PUT',
      url: `${process.env.NUXT_URL}/api/game`,
    })
    console.log(createdGameData)
    const eventBack = {
      gameId: createdGameData.gameId,
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

    if ([...io._nsps.keys()].includes(`/game/${gameId}`)) {
      return
    }
    io.of(`/game/${gameId}`).on('connection', onGameConnection)
  })
})

server.listen(4000, () => {
  console.log('listening on *:4000')
})
