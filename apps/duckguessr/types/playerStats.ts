import Index from '@prisma/client'

export class MedalLevel {
  medalType: string
  levels: number[]

  constructor(medalType: string, levels: number[]) {
    this.medalType = medalType
    this.levels = levels
  }
}

export class MedalLevelAndProgress {
  level: number
  currentLevelPoints: number
  currentLevelProgressPoints: number

  constructor(level: number, currentLevelPoints: number, currentLevelProgressPoints: number) {
    this.level = level
    this.currentLevelPoints = currentLevelPoints
    this.currentLevelProgressPoints = currentLevelProgressPoints
  }
}

export interface PlayerWithSumScore extends Index.player {
  sum_score: number
}
