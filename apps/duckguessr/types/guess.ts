import Index from '@prisma/client'

export interface GuessRequest {
  personcode: string
}

export interface GuessResponse extends Index.round_score {
  answer: string
  roundScore: Index.round_score
}
