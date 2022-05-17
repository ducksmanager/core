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
  levelPercentage: number
  levelPercentageProgress: number

  constructor(
    level: number,
    currentLevelPoints: number,
    currentLevelProgressPoints: number,
    levelPercentage: number,
    levelPercentageProgress: number
  ) {
    this.level = level
    this.currentLevelPoints = currentLevelPoints
    this.currentLevelProgressPoints = currentLevelProgressPoints
    this.levelPercentage = levelPercentage
    this.levelPercentageProgress = levelPercentageProgress
  }
}
