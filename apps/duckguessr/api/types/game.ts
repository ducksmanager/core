import { game, gamePlayer, player, round, roundScore } from "@prisma/client";

import { Author } from "./roundWithScoresAndAuthor";


export interface GamePlayerWithFullPlayer extends gamePlayer {
  player: player;
}

export interface GameFullNoPersoncode extends game {
  authors: Author[];
  rounds: (Omit<round, "personcode"|"sitecodeUrl"> & {personcode?:string, sitecodeUrl?: string} & {roundScores: roundScore[]})[];
  gamePlayers: GamePlayerWithFullPlayer[];
}
