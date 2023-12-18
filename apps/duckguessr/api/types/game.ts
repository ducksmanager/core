import { dataset, game, gamePlayer, player } from "./prisma/client_duckguessr";

import { Author, RoundWithScoresAndAuthor } from "./roundWithScoresAndAuthor";

export interface GamePlayerWithFullPlayer extends gamePlayer {
  player: player;
}

export interface GameFullNoPersoncode extends game {
  dataset: dataset;
  authors: Author[];
  rounds: RoundWithScoresAndAuthor[];
  gamePlayers: GamePlayerWithFullPlayer[];
}
