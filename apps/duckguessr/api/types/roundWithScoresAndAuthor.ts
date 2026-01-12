import type { inducks_person } from "~prisma-schemas/schemas/coa/client/client";

import type { round, roundScore } from "../prisma/client_duckguessr/browser";

export type Author = Pick<
  inducks_person,
  "personcode" | "fullname" | "nationalitycountrycode"
>;

export interface UnfinishedRound
  extends Omit<round, "sitecodeUrl" | "personcode"> {
  roundScores: roundScore[];
  personcode: null;
}

export interface RoundWithScoresAndAuthor extends round {
  roundScores: roundScore[];
  personcode: string;
}

export interface OngoingRoundScore {
  timeSpentGuessing: number;
  playerId: number;
  roundId: number;
  scoreTypeName: null;
  score: null;
  speedBonus: number;
}
