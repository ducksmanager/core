import type Index from '@prisma/client'
import { GuessRequest, GuessResponse } from '../types/guess'
import { numberOfRounds } from './game'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const kickoffTime = 5000
const roundTime = 10000

export const getRoundWithScores = async (roundId: number) =>
  await prisma.round.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      id: roundId,
    },
  })

export async function createGameRounds(gameId: number) {
  const now = new Date(new Date().getTime() + 3000).getTime()
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
  const round = await getRoundWithScores(roundId)
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

  // @ts-ignore TS2742
  let roundScore: Index.round_score = {
    player_id: player.id,
    round_id: round.id,
  }

  if (personcode === round.personcode) {
    const timeSpentGuessing = Date.now() - round.started_at
    const speedBonus =
      timeSpentGuessing < roundTime / 2
        ? Number((100 - timeSpentGuessing * (100 / (roundTime / 2))).toFixed(0))
        : 0
    roundScore = {
      ...roundScore,
      score_type_name: 'Correct author',
      score: 100,
      percentage_time_spent_guessing: parseInt(
        (100 * ((timeSpentGuessing - roundTime) / roundTime)).toPrecision(1)
      ),
      speed_bonus: speedBonus,
    }
  } else {
    roundScore = {
      ...roundScore,
      score_type_name: 'Wrong author',
      score: 0,
    }
  }

  await prisma.round_score.create({ data: roundScore })

  return {
    roundScore,
    answer: round.personcode,
  } as GuessResponse
}
