import { users } from "../stores/users";
import { computed } from "vue";

const MEDAL_LEVELS = {
  Photographe: { 1: 50, 2: 150, 3: 600 },
  Createur: { 1: 20, 2: 70, 3: 150 },
  Duckhunter: { 1: 1, 2: 3, 3: 15 },
};

const RADIUS = 42;

export default function (contribution, userLevelPoints) {
  const circumference = Math.PI * RADIUS * 2,
    currentLevel = computed(() => {
      if (!contribution.value) {
        return null;
      }
      const level = MEDAL_LEVELS[contribution.value];
      const maxThresholdReached =
        Object.values(level)
          .filter((minimumPoints) => userLevelPoints >= minimumPoints)
          .pop() || 0;
      return parseInt(
        Object.keys(level).find((key) => level[key] === maxThresholdReached) ||
          0
      );
    }),
    currentLevelPoints = computed(() =>
      currentLevel.value === null
        ? null
        : MEDAL_LEVELS[contribution][currentLevel.value] || 0
    ),
    currentLevelThreshold = computed(() =>
      currentLevel.value === null || currentLevel.value === 3
        ? null
        : MEDAL_LEVELS[contribution][currentLevel.value + 1]
    ),
    pointsDiffNextLevel = computed(() =>
      currentLevel.value === null || currentLevel.value >= 3
        ? null
        : MEDAL_LEVELS[contribution][currentLevel.value + 1] - userLevelPoints
    ),
    medalProgressCurrentPercentage = computed(() =>
      currentLevel.value === null
        ? null
        : (100 * (userLevelPoints - currentLevelPoints.value)) /
          (currentLevelThreshold.value - currentLevelPoints.value)
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
    getLevelProgressPercentage = (extraPoints) =>
      currentLevelThreshold.value
        ? 100 *
          (extraPoints / currentLevelThreshold.value - currentLevelPoints.value)
        : 0;

  return {
    radius: RADIUS,
    currentLevel,
    currentLevelPoints,
    currentLevelThreshold,
    pointsDiffNextLevel,
    medalProgressCurrentPercentage,
    levelProgressPercentage,
    getLevelProgressPercentage,
  };
}
