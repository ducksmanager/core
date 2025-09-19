import type { inducks_person } from "~prisma-schemas/schemas/coa";

import type { round, roundScore } from "../prisma/client_duckguessr/browser";

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
