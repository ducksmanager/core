import Index from '@prisma/client'
import { GuessResponse } from '~/types/guess'

interface PlayerWithOptionalPassword extends Index.player {
  password: string | null
}

interface CommonEvents {
  iAmAlsoReady: (player: PlayerWithOptionalPassword, gameId: number) => void
  whoElseIsReady: (player: Index.player, gameId: number) => void
}

export interface ServerToClientEvents extends CommonEvents {
  iAmReadyWithGameID: (player: Index.player, gameId: number) => void
  playerGuessed: (guessResponse: GuessResponse) => void
}

export interface ClientToServerEvents extends CommonEvents {
  iAmReady: (
    username: string,
    password: string,
    gameType: string,
    dataset: string
  ) => void
  matchStarts: (gameId: number) => void
  guess: (username: string, roundId: number, personcode: string | null) => void
}

export interface InterServerEvents {}
export interface SocketData {}
