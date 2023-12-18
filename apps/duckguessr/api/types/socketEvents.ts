import {
  datasetEntryurl,
  entryurlDetails,
  entryurlDetailsDecision,
  player,
  Prisma,
  PrismaClient,
  round,
  roundScore,
} from "./prisma/client_duckguessr";

import { DatasetWithCounts } from "./dataset";
import { GameFullNoPersoncode } from "./game";
import { GuessResponse } from "./guess";
import { MatchDetails } from "./matchDetails";
import { UserGameMedalPoints, UserMedalPoints } from "./playerStats";

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
    round: Prisma.PromiseReturnType<typeof getRoundWithScores>
  ) => void;
  roundEnds: (
    round: Prisma.PromiseReturnType<typeof getRoundWithScores>,
    nextRound: Prisma.PromiseReturnType<typeof getRoundWithScores>
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
  getPodium: (callback: (players: (player & { sumScore: number })[]) => void) => void;
}

export interface ClientToServerEventsMaintenance {
  getMaintenanceDataForDataset: (dataset: string, decisions: (entryurlDetailsDecision | 'null')[], offset: number, callback: (
    entryurlsToMaintain: (datasetEntryurl & {
      entryurlDetails: entryurlDetails;
    })[]) => void) => void;
  getMaintenanceData: (callback: (
    datasets: { name: string; decision: entryurlDetailsDecision; count: number }[]) => void) => void;
  updateMaintenanceData: (
    data: { sitecodeUrl: string; decision: entryurlDetailsDecision }[], callback: () => void
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
    callback: (haveAllPlayersGuessed: boolean) => void
  ) => void;
  getStats: (
    gameId: number | null,
    callback: (stats: UserMedalPoints[]) => void
  ) => void;
  getGameStats: (
    gameId: number,
    callback: (stats: UserGameMedalPoints[]) => void
  ) => void;
  updateUser: (updatedUser: player, callback: (player: player) => void) => void;
  getGame: (gameId: number, callback: (game: GameFullNoPersoncode | null) => void) => void;
  getGameRounds: (gameId: number, callback: (game: null | {
    roundScores: roundScore[]
  } | (Pick<round, "gameId" | 'roundNumber'> & { base64: string })) => void) => void;
}

export interface InterServerEvents { }
export interface SocketData { }
