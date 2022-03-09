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

export type user = {
  username: string
}

export interface ServerToClientEvents {
  playerJoined: (username: string) => void
  matchStarts: (gameId: number) => void
  roundStarts: (round: Prisma.PromiseReturnType<typeof getRoundWithScores>) => void
  roundEnds: (round: Prisma.PromiseReturnType<typeof getRoundWithScores>) => void
  playerGuessed: (guessResponse: GuessResponse) => void
  logged: (user: user) => void
}

export interface ClientToServerEvents {
  login: (callback: Function) => void
  iAmReady: (gameType: string, dataset: string, callback: Function) => void
  iAmAlsoReady: (gameId: number, callback: Function) => void
  guess: (roundId: number, personcode: string | null) => void
}

export interface InterServerEvents {}
export interface SocketData {}
