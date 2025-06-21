import type Index from '@prisma/client'
import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../types/socketEvents'
import { createPlayerSocket } from './sockets/player'
import { createGameSocket } from './sockets/game'
require('dotenv').config({ path: '../.env' })

const http = require('http')

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const express = require('express')
const { createMatchmakingSocket } = require('./sockets/game')
const app = express()
const server = http.createServer(app)

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
  .then(async (pendingGames: Index.game[]) => {
    for (const pendingGame of pendingGames) {
      console.debug(`Creating socket for unfinished game with ID ${pendingGame.id}`)
      await createGameSocket(io, pendingGame.id)
    }
  })

server.listen(4000, () => {
  console.log('listening on *:4000')
})
