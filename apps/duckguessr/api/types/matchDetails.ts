import { player, userMedalPoints } from "../prisma/client_duckguessr";

export interface MatchDetails {
  isBotAvailable: boolean
  players: player[]
  playerStats: userMedalPoints[]
}
