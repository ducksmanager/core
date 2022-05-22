import Index from '@prisma/client'

export interface Author {
  personcode: string
  personfullname: string
  personnationality: string
}

export interface RoundWithScoresAndAuthor extends Index.round, Author {
  round_scores: Array<Index.round_score>
}

export interface OngoingRoundScore {
  time_spent_guessing: number
  player_id: number
  round_id: number
  score_type_name: null
  score: null
}
