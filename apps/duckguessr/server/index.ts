import type Index from '@prisma/client'
import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../types/socketEvents'
import { createPlayerSocket } from './sockets/player'
require('dotenv').config({ path: '../.env' })

const http = require('http')

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const express = require('express')
const { createMatchmakingSocket } = require('./sockets/matchmaking')
const app = express()
const server = http.createServer(app)

const { createGameSocket } = require('./sockets/game')

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  {
    cors: {
      origin: process.env.NUXT_URL,
      methods: ['GET'],
    },
    allowEIO3: true,
  }
)

createPlayerSocket(io)
createMatchmakingSocket(io)

prisma.game
  .findMany({
    where: {
      rounds: {
        some: {
          finished_at: { gt: new Date() },
        },
      },
    },
  })
  .then((pendingGames: Index.game[]) => {
    for (const pendingGame of pendingGames) {
      console.debug(`Creating socket for unfinished game with ID ${pendingGame.id}`)
      createGameSocket(io, pendingGame)
    }
  })

server.listen(4000, () => {
  console.log('listening on *:4000')
})
