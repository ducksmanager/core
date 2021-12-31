const { PrismaClient } = require('@prisma/client')
const game = require('../../server/game')
const round = require('../../server/round')

const prisma = new PrismaClient()
const { createGameSocket } = require('./game')

exports.createMatchmakingSocket = (io) => {
  io.of('/matchmaking').on('connection', (socket) => {
    console.log('a user connected')
    socket.on('iAmReady', async ({ username, password }) => {
      console.log(`${username} is ready`)
      const gameData = await game.createOrGetPending()
      const user = await game.associatePlayer(
        gameData.gameId,
        username,
        password
      )

      socket.emit('iAmReadyWithGameID', user, gameData.gameId)
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
    })
  })
}
