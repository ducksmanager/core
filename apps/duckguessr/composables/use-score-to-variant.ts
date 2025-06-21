import Index from '@prisma/client'
import { OngoingRoundScore } from '~/types/roundWithScoresAndAuthor'

export function useScoreToVariant(roundScore: Index.round_score | OngoingRoundScore | null) {
  switch (roundScore?.score_type_name) {
    case null:
    case undefined:
      return 'warning'
    case 'Correct author':
      return 'success'
    default:
      return 'danger'
  }
}
