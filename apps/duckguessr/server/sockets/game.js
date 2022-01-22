const { PrismaClient } = require('@prisma/client')
const round = require('../../server/round')
const game = require('../../server/game')
const { playAsBot } = require('../../server/predict')

const prisma = new PrismaClient()

exports.createGameSocket = (io, game) =>
  io.of(`/game/${game.id}`).on('connection', (socket) => {
    socket.on('guess', async ({ username }, roundId, guess) => {
      console.log(
        `${username} is guessing ${JSON.stringify(guess)} on round ${roundId}`
      )
      try {
        const guessResultsData = await round.guess(
          Object.values(global.cachedUsers).find(
            ({ username: cachedUsername }) => cachedUsername === username
          ).id,
          roundId,
          guess
        )
        if (guessResultsData) {
          socket.broadcast.emit('playerGuessed', guessResultsData)
          socket.emit('playerGuessed', guessResultsData)
        }
      } catch (e) {
        console.error(e)
      }
    })
  })

exports.addBotToGame = async (socket, gameId) => {
  const rounds = await prisma.rounds.findMany({
    where: {
      game_id: gameId,
    },
  })
  const botUsername = 'bot_us'
  await game.associatePlayer(gameId, botUsername)
  playAsBot(botUsername, socket, rounds)
}
