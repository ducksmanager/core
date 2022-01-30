import Index from '@prisma/client'

export interface roundWithScoresAndPerson extends Index.round {
  round_scores: Array<Index.round_score>
  personfullname: string
  personnationality: string
  personurl: string
}
