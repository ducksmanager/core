<template>
  <b-container v-if="levelsAndProgress">
    <b-row v-if="noMedalProgress" class="justify-content-center">
      {{ t("You haven't won medals during this game.") }}
    </b-row>
    <b-row v-else class="justify-content-center">
      <template v-for="(medalLevelAndProgress, type) in levelsAndProgress">
        <b-col
          v-if="medalLevelAndProgress.currentLevelProgressPoints"
          :key="type"
          class="flex-grow-0"
        >
          <Medal :type="type" :medal-level-and-progress="medalLevelAndProgress" />
        </b-col>
      </template>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { MedalLevel, MedalLevelAndProgress } from '~/types/playerStats'

const MEDAL_LEVELS: MedalLevel[] = [
  new MedalLevel('fast', [25, 150, 500]),
  new MedalLevel('ultra_fast', [10, 50, 200]),
  new MedalLevel('published_fr_recent', [10, 75, 300]),
]

const DATASET_WITH_MEDALS: { [key: number]: string } = {
  1: 'published_fr_recent',
}

const { t } = useI18n()

const props = defineProps({
  stats: {
    type: Object as () => { [key: string]: number },
    required: true,
  },
  datasetId: {
    type: Number,
    required: true,
  },
})

const statsMatchingMedals = computed(
  () =>
    Object.keys(props.stats).reduce((acc, medalType) => {
      if (/^(ultra_)?fast/.test(medalType)) {
        return { ...acc, [medalType]: props.stats[medalType] }
      } else if (/^dataset/.test(medalType) && DATASET_WITH_MEDALS[props.datasetId]) {
        return {
          ...acc,
          [medalType.replace('dataset', DATASET_WITH_MEDALS[props.datasetId])]:
            props.stats[medalType],
        }
      }
      return acc
    }, {}) as { [key: string]: number }
)

const levelsAndProgress = computed(
  () =>
    MEDAL_LEVELS.reduce((acc, { medalType, levels }) => {
      const level =
        ([...levels]!
          .reverse()
          .findIndex(
            (levelThreshold: number) => statsMatchingMedals.value[medalType] > levelThreshold
          ) || -1) + 1
      if (level === 3) {
        return {
          ...acc,
          [medalType]: new MedalLevelAndProgress(level, 100, 0, 100, 0),
        }
      }
      const currentLevelThreshold = level === 0 ? 0 : levels[level - 1]
      const nextLevelThreshold = levels[level]
      const totalPointsToReachNextLevel = nextLevelThreshold - currentLevelThreshold

      const currentLevelPoints = statsMatchingMedals.value[medalType] - currentLevelThreshold
      const levelPercentage = (100 * currentLevelPoints) / totalPointsToReachNextLevel

      const currentLevelProgressPoints = statsMatchingMedals.value[`${medalType}_current_game`]
      const levelPercentageProgress =
        (100 * currentLevelProgressPoints) / totalPointsToReachNextLevel
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
    }, {}) as { [key: string]: MedalLevelAndProgress }
)

const noMedalProgress = computed(
  () =>
    levelsAndProgress.value &&
    !Object.values(levelsAndProgress.value).some(
      ({ levelPercentageProgress }) => levelPercentageProgress > 0
    )
)
</script>

<style scoped></style>
