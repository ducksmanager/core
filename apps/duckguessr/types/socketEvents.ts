import Index, { Prisma, PrismaClient } from '@prisma/client'
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
  roundEnds: (
    round: Prisma.PromiseReturnType<typeof getRoundWithScores>,
    nextRound: Prisma.PromiseReturnType<typeof getRoundWithScores>
  ) => void
  gameEnds: () => void
  playerGuessed: (guessResponse: GuessResponse) => void
  logged: (player: Index.player) => void
  loginFailed: () => void
}

export interface ClientToServerEvents {
  login: (callback: Function) => void
  createMatch: (dataset: string, callback: Function) => void
  addBot: (gameId: number) => void
  joinMatch: (gameId: number, callback: Function) => void
  startMatch: (gameId: number) => void
  guess: (personcode: string | null) => void
  getStats: (gameId: number, callback: Function) => void
  updateUser: (updatedUser: Index.player, callback: Function) => void
}

export interface InterServerEvents {}
export interface SocketData {}
