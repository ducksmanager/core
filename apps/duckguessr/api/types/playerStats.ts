import {player} from '@prisma/client'

export type MedalLevel = {
  medalType: string;
  levels: number[];
};

export type MedalLevelAndProgress = {
  level: number;
  currentLevelPoints: number;
  currentLevelProgressPoints: number;
};

export interface PlayerWithSumScore extends player {
  sumScore: number
}

export interface UserMedalPoints {
  medalType: string;
  playerId: number;
  points: number;
}

export interface UserGameMedalPoints {
  medalType: string;
  playerId: number;
  gameId: number;
  points: number;
}
