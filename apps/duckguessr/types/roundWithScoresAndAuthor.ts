import Index from '@prisma/client'

export interface Author {
  personcode: string
  personfullname: string
  personnationality: string
}

export interface RoundWithScoresAndAuthor extends Index.round, Author {
  round_scores: Array<Index.round_score>
}
