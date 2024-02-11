import { player } from "../prisma/client_duckguessr";

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
