const http = require('http')
require('dotenv').config({ path: '../.env' })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const server = http.createServer(app)
const IO = require('socket.io')

const { createGameSocket } = require('./sockets/game')
const { createMatchmakingSocket } = require('./sockets/matchmaking')
const { createMaintenanceSocket } = require('./sockets/admin/maintenance')

global.cachedUsers = {}

const io = IO(server, {
  cors: {
    origin: process.env.NUXT_URL,
    methods: ['GET'],
  },
})

createMatchmakingSocket(io)
createMaintenanceSocket(io)

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
      createGameSocket(io, pendingGame)
    }
  })

server.listen(4000, () => {
  console.log('listening on *:4000')
})
