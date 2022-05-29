import Index from '@prisma/client'

export interface MatchDetails {
  isBotAvailable: boolean
  players: Index.player[]
}
