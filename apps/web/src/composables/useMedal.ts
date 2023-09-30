import { computed } from "vue";

const MEDAL_LEVELS: { [contribution: string]: { [level: number]: number } } = {
  edge_photographer: { 1: 50, 2: 150, 3: 600 },
  edge_designer: { 1: 20, 2: 70, 3: 150 },
  duckhunter: { 1: 1, 2: 3, 3: 15 },
};

const RADIUS = 42;

export default function (contribution: string, userLevelPoints: number) {
  const circumference = Math.PI * RADIUS * 2,
    currentLevel = computed(() => {
      const level = MEDAL_LEVELS[contribution];
      const maxThresholdReached =
        Object.values(level)
          .filter((minimumPoints) => userLevelPoints >= minimumPoints)
          .pop() || 0;
      return (
        Object.keys(level)
          .map((key) => parseInt(key))
          .find((key) => level[key] === maxThresholdReached) || 0
      );
    }),
    currentLevelPoints = computed(
      () => MEDAL_LEVELS[contribution][currentLevel.value] || 0,
    ),
    currentLevelThreshold = computed(() =>
      currentLevel.value === 3
        ? null
        : MEDAL_LEVELS[contribution][currentLevel.value + 1],
    ),
    pointsDiffNextLevel = computed(() =>
      currentLevel.value >= 3
        ? null
        : MEDAL_LEVELS[contribution][currentLevel.value + 1] - userLevelPoints,
    ),
    medalProgressCurrentPercentage = computed(() =>
      currentLevelThreshold.value === null
        ? 0
        : (100 * (userLevelPoints - currentLevelPoints.value)) /
          (currentLevelThreshold.value - currentLevelPoints.value),
    ),
    levelProgressPercentage = computed(() => {
      if (pointsDiffNextLevel.value === null) {
        return null;
      }
      const level = MEDAL_LEVELS[contribution];
      const currentLevelThreshold =
        currentLevel.value === 0 ? 0 : level[currentLevel.value];
      const nextLevelThreshold = level[currentLevel.value + 1];

      const levelProgress =
        (userLevelPoints - currentLevelThreshold) /
          (nextLevelThreshold - currentLevelThreshold) || 0.01;
      return (1 - levelProgress) * circumference;
    }),
    getLevelProgressPercentage = (extraPoints: number) =>
      currentLevelThreshold.value
        ? 100 *
          (extraPoints / currentLevelThreshold.value - currentLevelPoints.value)
        : 0;

  return {
    radius: RADIUS,
    circumference,
    currentLevel,
    currentLevelPoints,
    currentLevelThreshold,
    pointsDiffNextLevel,
    medalProgressCurrentPercentage,
    levelProgressPercentage,
    getLevelProgressPercentage,
  };
}
