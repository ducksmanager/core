import type {
  player,
  userMedalPoints,
} from "../prisma/client_duckguessr/browser";

export interface MatchDetails {
  isBotAvailable: boolean;
  players: player[];
  playerStats: userMedalPoints[];
}
