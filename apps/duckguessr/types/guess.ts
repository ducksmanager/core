import Index from '@prisma/client'

export interface GuessRequest {
  personcode: string
}

export interface GuessResponse extends Index.round_score {}

export interface GuessResponseWithAnswer extends GuessResponse {
  answer: string
}
