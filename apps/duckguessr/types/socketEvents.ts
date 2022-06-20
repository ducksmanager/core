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
  playerLeft: (username: string) => void
  matchStarts: () => void
  firstRoundWillStartSoon: (firstRoundStartTime: Date) => void
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
  addBot: () => void
  removeBot: () => void
  joinMatch: (callback: Function) => void
  startMatch: () => void
  guess: (personcode: string | null, callback: Function) => void
  getStats: (callback: Function) => void
  getGameStats: (gameId: number, callback: Function) => void
  updateUser: (updatedUser: Index.player, callback: Function) => void
}

export interface InterServerEvents {}
export interface SocketData {}
