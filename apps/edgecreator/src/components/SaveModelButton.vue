import { inducks_person } from "~prisma-clients/client_coa";

import { round, roundScore } from "../prisma/client_duckguessr";

export type Author = Pick<
  inducks_person,
  "personcode" | "fullname" | "nationalitycountrycode"
>;

export interface UnfinishedRound
  extends Omit<round, "sitecodeUrl" | "personcode"> {
  roundScores: roundScore[];
}

export interface RoundWithScoresAndAuthor extends round, Author {
  roundScores: roundScore[];
}

export interface OngoingRoundScore {
  timeSpentGuessing: number;
  playerId: number;
  roundId: number;
  scoreTypeName: null;
  score: null;
  speedBonus: number;
}
