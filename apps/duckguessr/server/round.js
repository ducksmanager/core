const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const numberOfRounds = 8
const kickoffTime = 20000
const roundTime = 50000

exports.getRound = async (roundId) => {
  return await prisma.rounds.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      id: roundId,
    },
  })
}

exports.createGameRounds = async (gameId) => {
  const now = new Date().getTime()
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
            started_at: new Date(now + roundNumber * (kickoffTime + roundTime)),
            finished_at: new Date(
              now + (roundNumber * (kickoffTime + roundTime) + roundTime)
            ),
          },
        })
      )
  )
}

exports.guess = async (playerId, roundId, guess) => {
  const round = await exports.getRound(roundId)
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

  let scoreData

  if (guess.personcode === round.personcode) {
    scoreData = {
      score_type_name: 'Correct author',
      score: 300,
    }
  } else if (guess.personnationality === round.personnationality) {
    scoreData = {
      score_type_name: 'Correct nationality',
      score: 100,
    }
  } else {
    scoreData = {
      score_type_name: 'Wrong author',
      score: 0,
    }
  }

  const scoreWithMetadata = {
    ...scoreData,
    player_id: playerId,
    round_id: round.id,
  }
  await prisma.round_scores.create({ data: scoreWithMetadata })

  return {
    ...scoreWithMetadata,
    round_number: round.round_number,
    username: global.cachedUsers[playerId].username,
  }
}
