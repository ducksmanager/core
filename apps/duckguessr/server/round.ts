import type Index from '@prisma/client'
import { GuessRequest, GuessResponse } from '../types/guess'

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const gameKickoffTime = 10000
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

export const setRoundTimes = async (round: Index.round) => {
  const offset = new Date(
    new Date().getTime() + (round.round_number === 1 ? gameKickoffTime : kickoffTime)
  ).getTime()
  return await prisma.round.update({
    where: {
      id: round.id,
    },
    include: {
      round_scores: true,
    },
    data: {
      started_at: new Date(offset),
      finished_at: new Date(offset + roundTime),
    },
  })
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
      time_spent_guessing: timeSpentGuessing,
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
