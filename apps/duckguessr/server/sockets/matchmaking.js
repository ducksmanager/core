const { io: IOClient } = require('socket.io-client')
const { PrismaClient } = require('@prisma/client')
const game = require('../../server/game')
const round = require('../../server/round')
const { createGameSocket, addBotToGame } = require('./game')

const prisma = new PrismaClient()

exports.createMatchmakingSocket = (io) => {
  io.of('/matchmaking').on('connection', (socket) => {
    console.log('a user connected')
    socket.on('iAmReady', async ({ username, password, gameType }) => {
      console.log(`${username} is ready`)
      const { gameId } = await game.createOrGetPending(gameType)
      const user = await game.associatePlayer(gameId, username, password)

      socket.emit('iAmReadyWithGameID', user, gameId)
    })
    socket.on('whoElseIsReady', (user, gameId) => {
      console.log(
        `${user.username} wants to know who else is in game ID ${gameId}`
      )
      socket.broadcast.emit('whoElseIsReady', user, gameId)
    })
    socket.on('iAmAlsoReady', async ({ username, password }, gameId) => {
      console.log(`${username} is also ready in game ID ${gameId}`)
      const user = await game.associatePlayer(gameId, username, password)

      socket.broadcast.emit('iAmAlsoReady', user, gameId)
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
      createGameSocket(io, currentGame)

      const botGameSocket = IOClient(
        `${process.env.SOCKET_URL}/game/${currentGame.id}`
      )
      if (currentGame.game_type === 'against_bot') {
        await addBotToGame(botGameSocket, currentGame.id)
      }
    })
  })
}
