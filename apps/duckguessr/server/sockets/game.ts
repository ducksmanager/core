import type Index from '@prisma/client'
import { Server, Socket } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { GuessResponse } from '../../types/guess'
const { PrismaClient } = require('@prisma/client')
const { playAsBot } = require('../predict')
const round = require('../../server/round')
const game = require('../../server/game')

const prisma = new PrismaClient()

exports.createGameSocket = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  game: Index.games
) =>
  io.of(`/game/${game.id}`).on('connection', (socket: Socket) => {
    socket.on(
      'guess',
      async (username: string, roundId: number, personcode: string) => {
        console.log(
          `${username} is guessing ${JSON.stringify(
            personcode
          )} on round ${roundId}`
        )
        try {
          const guessResultsData = await round.guess(
            await prisma.players.findFirst({
              where: {
                username,
              },
            }),
            roundId,
            { personcode }
          )
          if (guessResultsData) {
            socket.emit('playerGuessed', guessResultsData)
            socket.broadcast.emit('playerGuessed', {
              ...guessResultsData,
              answer: null,
            } as GuessResponse)
          }
        } catch (e) {
          console.error(e)
        }
      }
    )
  })

exports.addBotToGame = async (socket: Socket, gameId: number) => {
  const rounds = await prisma.rounds.findMany({
    where: {
      game_id: gameId,
    },
  })
  const botUsername = 'bot_us'
  await game.associatePlayer(gameId, botUsername)
  playAsBot(botUsername, socket, rounds)
}
