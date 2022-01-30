import Index from '@prisma/client'
import { GuessResponse } from '~/types/guess'

interface PlayerWithOptionalPassword extends Index.player {
  password: string | null
}

export interface ServerToClientEvents {
  iAmAlsoReady: (player: PlayerWithOptionalPassword, gameId: number) => void
  whoElseIsReady: (player: Index.player, gameId: number) => void
  iAmReadyWithGameID: (player: Index.player, gameId: number) => void
  playerGuessed: (guessResponse: GuessResponse) => void
}

export interface ClientToServerEvents {
  iAmReady: (
    username: string,
    password: string,
    gameType: string,
    dataset: string
  ) => void
  iAmAlsoReady: (player: PlayerWithOptionalPassword, gameId: number) => void
  whoElseIsReady: (player: Index.player, gameId: number) => void
  matchStarts: (gameId: number) => void
  guess: (username: string, roundId: number, personcode: string | null) => void
}

export interface InterServerEvents {}
export interface SocketData {}
