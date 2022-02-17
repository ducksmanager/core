import type Index from '@prisma/client'
import { GuessRequest, GuessResponse } from '../types/guess'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const numberOfRounds = 8
const kickoffTime = 5000
const roundTime = 10000

export const getRound = async (roundId: number): Promise<Index.round> =>
  await prisma.round.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      id: roundId,
    },
  })

export async function createGameRounds(gameId: number) {
  const now = new Date().getTime()
  return await prisma.$transaction(
    Array(numberOfRounds)
      .fill(0)
      .map((_, roundNumber) =>
        prisma.round.updateMany({
          where: {
            game_id: gameId,
            round_number: roundNumber + 1,
            started_at: null,
          },
          data: {
            started_at: new Date(now + roundNumber * (kickoffTime + roundTime)),
            finished_at: new Date(now + (roundNumber * (kickoffTime + roundTime) + roundTime)),
          },
        })
      )
  )
}

export async function guess(
  player: Index.player,
  roundId: number,
  { personcode }: GuessRequest
): Promise<GuessResponse | void> {
  const round = await getRound(roundId)
  if (
    await prisma.round_score.findFirst({
      where: {
        player_id: player.id,
        round_id: round.id,
      },
      include: {
        player: true,
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
  const scoreWithMetadata: Index.round_score = {
    ...scoreData,
    player_id: player.id,
    round_id: round.id,
  }
  await prisma.round_score.create({ data: scoreWithMetadata })

  return {
    ...scoreWithMetadata,
    answer: round.personcode,
  }
}
