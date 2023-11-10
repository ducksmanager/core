import {player} from '@prisma/client'

import { UserMedalPoints } from './playerStats'

export interface MatchDetails {
  isBotAvailable: boolean
  players: player[]
  playerStats: UserMedalPoints[]
}
