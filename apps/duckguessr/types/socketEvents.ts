import { Prisma, PrismaClient } from '@prisma/client'
import { GuessResponse } from '~/types/guess'
const prisma = new PrismaClient()

const getRoundWithScores = async (roundId: number) =>
  await prisma.round.findFirst({
    include: {
      round_scores: true,
    },
    where: {
      id: roundId,
    },
  })

export interface ServerToClientEvents {
  playerJoined: (username: string) => void
  matchStarts: (gameId: number) => void
  roundStarts: (round: Prisma.PromiseReturnType<typeof getRoundWithScores>) => void
  roundEnds: (round: Prisma.PromiseReturnType<typeof getRoundWithScores>) => void
  playerGuessed: (guessResponse: GuessResponse) => void
}

export interface ClientToServerEvents {
  iAmReady: (
    username: string,
    password: string,
    gameType: string,
    dataset: string,
    callback: Function
  ) => void
  iAmAlsoReady: (gameId: number, username: string, password: string, callback: Function) => void
  guess: (username: string, roundId: number, personcode: string | null) => void
}

export interface InterServerEvents {}
export interface SocketData {}
