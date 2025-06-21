import Index from '@prisma/client'
import { UserMedalPoints } from '~/types/playerStats'

export interface MatchDetails {
  isBotAvailable: boolean
  players: Index.player[]
  playerStats: UserMedalPoints[]
}
