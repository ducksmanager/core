import Index from '@prisma/client'
import { GuessResponse } from '~/types/guess'

interface playerWithOptionalPassword extends Index.players {
  password: string | null
}

export interface ServerToClientEvents {
  iAmAlsoReady: (player: playerWithOptionalPassword, gameId: number) => void
  whoElseIsReady: (player: Index.players, gameId: number) => void
  iAmReadyWithGameID: (player: Index.players, gameId: number) => void
  playerGuessed: (guessResponse: GuessResponse) => void
}

export interface ClientToServerEvents {
  iAmReady: (
    username: string,
    password: string,
    gameType: string,
    dataset: string
  ) => void
  iAmAlsoReady: (player: playerWithOptionalPassword, gameId: number) => void
  whoElseIsReady: (player: Index.players, gameId: number) => void
  matchStarts: (gameId: number) => void
  guess: (username: string, roundId: number, personcode: string | null) => void
}

export interface InterServerEvents {}
export interface SocketData {}
