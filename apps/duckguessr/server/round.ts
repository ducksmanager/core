import type Index from '@prisma/client'
import { GuessRequest, GuessResponseWithAnswer } from '../types/guess'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const numberOfRounds = 8
const kickoffTime = 8000
const roundTime = 15000

export async function getRound(roundId: number) {
  return await prisma.rounds.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      id: roundId,
    },
  })
}

export async function createGameRounds(gameId: number) {
  const now = new Date().getTime()
  return await prisma.$transaction(
    Array(numberOfRounds)
      .fill(0)
      .map((_, roundNumber) =>
        prisma.rounds.updateMany({
          where: {
            game_id: gameId,
            round_number: roundNumber + 1,
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

export async function guess(
  player: Index.players,
  roundId: number,
  { personcode }: GuessRequest
): Promise<GuessResponseWithAnswer | void> {
  const round = await exports.getRound(roundId)
  if (!personcode) {
    console.error(`No guess was provided`)
  }
  if (
    await prisma.round_scores.findFirst({
      where: {
        player_id: player.id,
        round_id: round.id,
      },
      include: {
        players: true,
      },
    })
  ) {
    console.error(`Player ${player.username} already guessed round ${round.id}`)
    return
  }

  let scoreData

  if (personcode === round.personcode) {
    scoreData = {
      score_type_name: 'Correct author',
      score: 300,
    }
  } else {
    scoreData = {
      score_type_name: 'Wrong author',
      score: 0,
    }
  }

  // @ts-ignore TS2742
  const scoreWithMetadata: Index.round_scores = {
    ...scoreData,
    player_id: player.id,
    round_id: round.id,
  }
  await prisma.round_scores.create({ data: scoreWithMetadata })

  return {
    ...scoreWithMetadata,
    round_number: round.round_number,
    players: round.players,
    answer: round.personcode,
  }
}
