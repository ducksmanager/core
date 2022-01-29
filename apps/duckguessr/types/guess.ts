import Index from '@prisma/client'

export interface GuessRequest {
  personcode: string
}

export interface GuessResponse extends Index.round_scores {
  round_number: number
  players: Index.players
}

export interface GuessResponseWithAnswer extends GuessResponse {
  answer: string
}
