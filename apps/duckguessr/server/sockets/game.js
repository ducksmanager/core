const round = require('../../server/round')

exports.createGameSocket = function (io, game) {
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
        socket.broadcast.emit('playerGuessed', guessResultsData)
        socket.emit('playerGuessed', guessResultsData)
      } catch (e) {
        console.error(e)
      }
    })
  })
}
