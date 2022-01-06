const http = require('http')
require('dotenv').config({ path: '../.env' })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const server = http.createServer(app)
const IO = require('socket.io')

const { createGameSocket, addBotToGame } = require('./sockets/game')
const { createMatchmakingSocket } = require('./sockets/matchmaking')

global.cachedUsers = {}

const io = IO(server, {
  cors: {
    origin: process.env.NUXT_URL,
    methods: ['GET'],
  },
})

createMatchmakingSocket(io)

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
  .then(async (pendingGames) => {
    for (const pendingGame of pendingGames) {
      console.debug(
        `Creating socket for unfinished game with ID ${pendingGame.id}`
      )
      const gameSocket = createGameSocket(io, pendingGame)
      if (pendingGame.game_type === 'against_bot') {
        await addBotToGame(gameSocket, gameSocket.id)
      }
    }
  })

server.listen(4000, () => {
  console.log('listening on *:4000')
})
