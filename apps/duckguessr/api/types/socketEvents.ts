import { getGameWithRoundsDatasetPlayers } from "game";
import type {
  player,
  round,
} from "../prisma/client_duckguessr/client";

export type CurrentGame = NonNullable<Awaited<ReturnType<typeof getGameWithRoundsDatasetPlayers>>>

export type InterServerEvents = Record<string, never>;
export type SocketGameData = { user: player, gameId: number, currentRound: round, currentGame: CurrentGame };
