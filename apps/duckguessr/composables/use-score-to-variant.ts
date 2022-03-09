import Index from '@prisma/client'

export function useScoreToVariant(roundScore: Index.round_score | null) {
  switch (roundScore?.score_type_name) {
    case null:
      return 'default'
    case 'Correct author':
      return 'success'
    case 'Correct nationality':
      return 'warning'
    default:
      return 'danger'
  }
}
