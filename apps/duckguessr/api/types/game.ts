import type {
  dataset,
  game,
  gamePlayer,
  player,
} from "../prisma/client_duckguessr/client";
import type {
  Author,
  RoundWithScoresAndAuthor,
  UnfinishedRound,
} from "./roundWithScoresAndAuthor";

export interface GamePlayerWithFullPlayer extends gamePlayer {
  player: player;
}

export interface GameFull extends game {
  dataset: dataset;
  authors: Author[];
  rounds: (UnfinishedRound | RoundWithScoresAndAuthor)[];
  gamePlayers: GamePlayerWithFullPlayer[];
}

export interface GameFullNoPersoncode extends Omit<GameFull, "rounds"> {
  rounds: (UnfinishedRound | RoundWithScoresAndAuthor)[];
}
