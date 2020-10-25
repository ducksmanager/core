import {mapActions} from "vuex";

const MEDAL_LEVELS = {
  Photographe: {1: 50, 2: 150, 3: 600},
  Createur: {1: 20, 2: 70, 3: 150},
  Duckhunter: {1: 1, 2: 3, 3: 15}
};

const RADIUS = 42

export default {

  data() {
    return {
      radius: RADIUS,
      circumference: Math.PI * RADIUS * 2,
    }
  },

  computed: {
    currentLevel() {
      if (!this.contribution) {
        return null
      }
      const vm = this
      const level = MEDAL_LEVELS[this.contribution];
      const maxThresholdReached = Object.values(level).filter(minimumPoints => vm.points >= minimumPoints).pop() || 0
      return parseInt(Object.keys(level).find(key => level[key] === maxThresholdReached) || 0)
    },

    currentLevelPoints() {
      return this.currentLevel === null ? null : MEDAL_LEVELS[this.contribution][this.currentLevel] || 0
    },

    currentLevelThreshold() {
      return this.currentLevel === null
        ? null
        : MEDAL_LEVELS[this.contribution][this.currentLevel+1]
    },

    pointsDiffNextLevel() {
      return this.currentLevel === null || this.currentLevel >= 3
        ? null
        : MEDAL_LEVELS[this.contribution][this.currentLevel + 1] - this.userLevelPoints
    },
    medalProgressCurrentPercentage() {
      return this.currentLevel === null
        ? null
        : 100 * (this.userLevelPoints - this.currentLevelPoints) / (this.currentLevelThreshold - this.currentLevelPoints)
    },

    levelProgressPercentage() {
      if (this.pointsDiffNextLevel === null) {
        return null
      }
      const level = MEDAL_LEVELS[this.contribution];
      const currentLevelThreshold = this.currentLevel === 0 ? 0 : level[this.currentLevel]
      const nextLevelThreshold = level[this.currentLevel + 1]

      const levelProgress = (this.userLevelPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold) || .01
      return (1 - levelProgress) * this.circumference
    },
  },

  methods: {
    ...mapActions("users", ["fetchStats"]),

    getLevelProgressPercentage(extraPoints) {
      return this.currentLevelThreshold ? (100 * (extraPoints / this.currentLevelThreshold - this.currentLevelPoints)) : 0
    }
  }
}