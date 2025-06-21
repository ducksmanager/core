<template>
  <b-container v-if="levelsAndProgress" class="d-flex flex-column align-items-center p-0">
    <b-row v-if="dataset && noMedalProgress" class="justify-content-center">
      {{ t("You haven't won medals during this game.") }}
    </b-row>
    <b-row v-else class="justify-content-center align-items-center w-100">
      <template v-if="cols">
        <template v-for="type in statsMatchingMedals">
          <b-col
            :key="type"
            class="flex-grow-0"
            :class="{
              'px-0': !dataset,
              'd-flex': withDetails,
              'justify-content-center': withDetails,
            }"
            :cols="cols"
            :lg="colsLg"
          >
            <Medal
              :type="type"
              :medal-level-and-progress="levelsAndProgress[type]"
              :with-game-data="!!dataset"
              :with-details="withDetails"
            />
          </b-col>
        </template>
      </template>
      <template v-else>
        <Medal
          v-for="type in statsMatchingMedals"
          :key="type"
          :style="{ width: '2.5rem' }"
          :type="type"
          :medal-level-and-progress="levelsAndProgress[type]"
          :with-game-data="!!dataset"
          :with-details="withDetails"
          :with-title="false"
        />
      </template>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { computed } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import Index from '@prisma/client'
import { MEDAL_LEVELS, userStore } from '~/store/user'
import { MedalLevelAndProgress, UserMedalPoints } from '~/types/playerStats'
import { getDuckguessrId } from '~/composables/user'

const DATASET_WITH_MEDALS: string[] = ['published-fr-recent', 'it', 'us']

const { t } = useI18n()
const duckguessrId = getDuckguessrId()

const props = withDefaults(
  defineProps<{
    dataset?: Index.dataset | null
    withDetails: boolean
    statsOverride?: UserMedalPoints[] | null
    cols: number | null
    colsLg: number | null
  }>(),
  {
    dataset: null,
    statsOverride: null,
    cols: null,
    colsLg: 3,
  }
)

const stats = computed(() =>
  props.dataset ? userStore().gameStats : props.statsOverride || userStore().stats
)

const statsMatchingMedals = computed(() =>
  stats.value
    ?.filter(
      ({ medal_type: medalType, player_id, points }) =>
        points > 0 &&
        (props.statsOverride || duckguessrId === player_id) &&
        (/^(ultra_)?fast/.test(medalType) ||
          !props.dataset ||
          DATASET_WITH_MEDALS.includes(props.dataset.name))
    )
    ?.map(({ medal_type }) => medal_type)
)

const levelsAndProgress = computed((): { [key: string]: MedalLevelAndProgress } =>
  !stats.value
    ? {}
    : MEDAL_LEVELS.reduce((acc, { medalType, levels }) => {
        let level =
          levels.length -
          [...levels]!.reverse().findIndex(
            (levelThreshold: number) =>
              (
                stats.value!.find(({ medal_type }) => medal_type === medalType) || {
                  points: 0,
                }
              ).points >= levelThreshold
          )

        if (level === 4) {
          level = 0
        }
        if (level === 3) {
          return {
            ...acc,
            [medalType]: new MedalLevelAndProgress(level, 0, 0),
          }
        }
        const currentLevelThreshold = level === 0 ? 0 : levels[level - 1]
        const currentLevelPoints =
          (stats.value!.find(({ medal_type }) => medal_type === medalType) || { points: 0 })
            .points - currentLevelThreshold
        const currentLevelProgressPoints = userStore().gameStats
          ? (
              userStore().gameStats!.find(({ medal_type }) => medal_type === medalType) || {
                points: 0,
              }
            ).points
          : 0

        const medalLevelAndProgress = new MedalLevelAndProgress(
          level,
          currentLevelPoints,
          currentLevelProgressPoints
        )
        return {
          ...acc,
          [medalType]: medalLevelAndProgress,
        }
      }, {})
)

const noMedalProgress = computed(
  () =>
    levelsAndProgress.value &&
    !Object.values(levelsAndProgress.value).some(
      ({ currentLevelProgressPoints }) => currentLevelProgressPoints > 0
    )
)
</script>

<style scoped lang="scss"></style>
