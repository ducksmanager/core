<template>
  <b-container>
    <b-row v-if="noMedalProgress" class="justify-content-center">
      {{ t("You haven't won medals during this game.") }}
    </b-row>
    <b-row v-else>
      <b-col v-for="(medalLevelAndProgress, type) in levelsAndProgress" :key="type">
        <Medal
          v-if="medalLevelAndProgress.currentLevelProgressPoints"
          :type="type"
          :medal-level-and-progress="medalLevelAndProgress"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'
import { MedalLevel, MedalLevelAndProgress } from '~/types/playerStats'

const MEDAL_LEVELS: MedalLevel[] = [
  new MedalLevel('fast', [25, 150, 500]),
  new MedalLevel('ultra_fast', [10, 50, 200]),
]

const { t } = useI18n()

const props = defineProps({
  stats: {
    type: Object as () => { [key: string]: number },
    required: true,
  },
})

const levelsAndProgress: { [key: string]: MedalLevelAndProgress } = MEDAL_LEVELS.reduce(
  (acc, { medalType, levels }) => {
    const level =
      ([...levels]!
        .reverse()
        .find((levelThreshold: number) => props.stats[medalType] > levelThreshold) || -1) + 1
    if (level === 3) {
      return {
        ...acc,
        [medalType]: new MedalLevelAndProgress(level, 100, 0, 100, 0),
      }
    }
    const currentLevelThreshold = level === 0 ? 0 : levels[level - 1]
    const nextLevelThreshold = levels[level]
    const totalPointsToReachNextLevel = nextLevelThreshold - currentLevelThreshold

    const currentLevelPoints = props.stats[medalType] - currentLevelThreshold
    const levelPercentage = (100 * currentLevelPoints) / totalPointsToReachNextLevel

    const currentLevelProgressPoints = props.stats[`${medalType}_current_game`]
    const levelPercentageProgress = (100 * currentLevelProgressPoints) / totalPointsToReachNextLevel
    return {
      ...acc,
      [medalType]: new MedalLevelAndProgress(
        level,
        currentLevelPoints,
        currentLevelProgressPoints,
        levelPercentage,
        levelPercentageProgress
      ),
    }
  },
  {}
)
const noMedalProgress = !Object.values(levelsAndProgress).some(
  ({ levelPercentageProgress }) => levelPercentageProgress > 0
)
</script>

<style scoped></style>
