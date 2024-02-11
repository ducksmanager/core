import { roundScore } from "../prisma/client_duckguessr";

export interface GuessRequest {
  personcode: string;
}

export interface GuessResponse extends roundScore {
  answer: string | null;
  roundScore: roundScore;
}
