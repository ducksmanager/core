import { GuessResponse } from '~/types/guess'

export interface ServerToClientEvents {
  playerJoined: (username: string) => void
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
  matchStarts: (gameId: number) => void
  guess: (username: string, roundId: number, personcode: string | null) => void
}

export interface InterServerEvents {}
export interface SocketData {}
