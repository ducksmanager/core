const http = require('http')
const axios = require('axios')
require('dotenv').config({ path: '../.env' })

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

io.of('/game').on('connection', (socket) => {
  console.log('a user connected')
  socket.on('iAmReady', async ({ username, id }) => {
    console.log(`${username} is ready`)
    const createdGameData = await axios.request({
      method: 'PUT',
      url: `${process.env.NUXT_URL}/api/game`,
    })
    console.log(createdGameData.data)
    const eventBack = {
      gameId: createdGameData.data.gameId,
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
})

server.listen(4000, () => {
  console.log('listening on *:4000')
})
