import Index from '@prisma/client'

export interface roundWithScoresAndPerson extends Index.rounds {
  round_scores: Array<Index.round_scores>
  personfullname: string
  personnationality: string
  personurl: string
}
