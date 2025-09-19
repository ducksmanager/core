import type { roundScore } from "../prisma/client_duckguessr/browser";

export interface GuessRequest {
  personcode: string;
}

export interface GuessResponse extends roundScore {
  answer: string | null;
  roundScore: roundScore;
}
