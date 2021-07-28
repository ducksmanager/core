const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const numberOfRounds = 8
const kickoffTime = 5000
const roundTime = 10000

exports.getStartedRound = async (gameId, finished) => {
  return await prisma.rounds.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      game_id: parseInt(gameId),
      finished_at: finished ? { not: null } : null,
    },
    orderBy: {
      round_number: finished ? 'desc' : 'asc',
    },
  })
}

exports.createGameRounds = async (gameId) => {
  const now = new Date()
  return await prisma.$transaction(
    Array(numberOfRounds)
      .fill(0)
      .map((_, roundNumber) =>
        prisma.rounds.updateMany({
          where: {
            game_id: gameId,
            round_number: roundNumber,
            started_at: null,
          },
          data: {
            started_at: new Date(
              now.getTime() + roundNumber * (kickoffTime + roundTime)
            ),
            finished_at: new Date(
              now.getTime() +
                (roundNumber * (kickoffTime + roundTime) + roundTime)
            ),
          },
        })
      )
  )
}

exports.guess = async (playerId, gameId, guess) => {
  const round = await exports.getStartedRound(gameId, false)
  const scores = []
  if (guess == null) {
    throw new Error(`No guess was provided`)
  }
  if (
    await prisma.round_scores.findFirst({
      where: {
        player_id: playerId,
        round_id: round.id,
      },
    })
  ) {
    throw new Error(`Player ${playerId} already guessed round ${round.id}`)
  }

  scores.push({
    score_type_name: 'Correct author',
    score: guess.personcode === round.personcode ? 350 : 0,
  })
  scores.push({
    score_type_name: 'Correct nationality',
    score: guess.personnationality === round.personnationality ? 150 : 0,
  })

  const scoresWithMetadata = scores.map((score) => ({
    ...score,
    player_id: playerId,
    round_id: round.id,
  }))
  await prisma.round_scores.createMany({
    data: scoresWithMetadata,
  })

  return scoresWithMetadata
}
