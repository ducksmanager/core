const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
