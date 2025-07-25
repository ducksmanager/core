import type {
  player,
  userMedalPoints,
} from "../prisma/client_duckguessr/client";

export interface MatchDetails {
  isBotAvailable: boolean;
  players: player[];
  playerStats: userMedalPoints[];
}
