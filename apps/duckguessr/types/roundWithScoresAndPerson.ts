import Index from '@prisma/client'

export interface roundWithScoresAndPerson extends Index.rounds {
  round_scores: Array<Index.round_scores>
  personfullname: String
  personnationality: String
  personurl: String
}
