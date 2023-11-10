import { round, roundScore } from "@prisma/client";

import { inducks_person } from "~prisma-clients/client_coa";

export type Author = Pick<inducks_person, "personcode" | "fullname" | "nationalitycountrycode">;

export interface RoundWithScoresAndAuthor extends round, Author {
  roundScores: Array<roundScore>;
}

export interface OngoingRoundScore {
  timeSpentGuessing: number;
  playerId: number;
  roundId: number;
  scoreTypeName: null;
  score: null;
  speedBonus: number;
}
