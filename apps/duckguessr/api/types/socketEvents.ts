import type {
  datasetEntryurl,
  entryurlDetails,
  entryurlDetailsDecision,
  player,
  Prisma,
  round,
  roundScore,
  userGameMedalPoints,
  userMedalPoints,
} from "../prisma/client_duckguessr/client";
import { PrismaClient } from "../prisma/client_duckguessr/client";
import type { DatasetWithCounts } from "./dataset";
import type { GameFull } from "./game";
import type { GuessResponse } from "./guess";
import type { MatchDetails } from "./matchDetails";

const prisma = new PrismaClient();

const getRoundWithScores = (roundId: number) =>
  prisma.round.findFirstOrThrow({
    include: {
      roundScores: true,
    },
    where: {
      id: roundId,
    },
  });

export interface ServerToClientEvents {
  playerConnectedToMatch: () => void;
  playerJoined: (player: player) => void;
  playerLeft: (player: player) => void;
  matchStarts: () => void;
  firstRoundWillStartSoon: (firstRoundStartTime: Date) => void;
  roundStarts: (
    round: Prisma.PromiseReturnType<typeof getRoundWithScores>,
  ) => void;
  roundEnds: (
    round: Prisma.PromiseReturnType<typeof getRoundWithScores>,
    nextRound: Prisma.PromiseReturnType<typeof getRoundWithScores>,
  ) => void;
  gameEnds: () => void;
  playerGuessed: (guessResponse: GuessResponse) => void;
  logged: (player: player) => void;
  loginFailed: () => void;
}

export interface ClientToServerEventsDatasets {
  getDatasets: (callback: (datasets: DatasetWithCounts[]) => void) => void;
}

export interface ClientToServerEventsPodium {
  getPodium: (
    callback: (players: (player & { sumScore: number })[]) => void,
  ) => void;
}

export interface ClientToServerEventsMaintenance {
  getMaintenanceDataForDataset: (
    dataset: string,
    decisions: (entryurlDetailsDecision | "null")[],
    offset: number,
    callback: (
      entryurlsToMaintain: (datasetEntryurl & {
        entryurlDetails: entryurlDetails;
      })[],
    ) => void,
  ) => void;
  getMaintenanceData: (
    callback: (
      datasets: {
        name: string;
        decision: entryurlDetailsDecision;
        count: number;
      }[],
    ) => void,
  ) => void;
  updateMaintenanceData: (
    data: { sitecodeUrl: string; decision: entryurlDetailsDecision }[],
    callback: () => void,
  ) => void;
}

export interface ClientToServerEvents {
  createMatch: (dataset: string, callback: (gameId: number) => void) => void;
  addBot: () => void;
  removeBot: () => void;
  joinMatch: (callback: (matchDetails: MatchDetails) => void) => void;
  startMatch: () => void;
  guess: (
    personcode: string | null,
    callback: (haveAllPlayersGuessed: boolean) => void,
  ) => void;
  getStats: (
    gameId: number | null,
    callback: (stats: userMedalPoints[]) => void,
  ) => void;
  getGameStats: (
    gameId: number,
    callback: (stats: userGameMedalPoints[]) => void,
  ) => void;
  updateUser: (updatedUser: player, callback: (player: player) => void) => void;
  getGame: (gameId: number, callback: (game: GameFull | null) => void) => void;
  getGameRounds: (
    gameId: number,
    callback: (
      game:
        | null
        | {
            roundScores: roundScore[];
          }
        | (Pick<round, "gameId" | "roundNumber"> & { base64: string }),
    ) => void,
  ) => void;
}

export type InterServerEvents = Record<string, never>;
export type SocketData = Record<string, never>;
