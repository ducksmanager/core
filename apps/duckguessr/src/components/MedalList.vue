<template>
  <b-container
    v-if="levelsAndProgress"
    class="d-flex flex-column align-items-center p-0"
  >
    <b-row v-if="dataset && noMedalProgress" class="justify-content-center">
      {{ t("You haven't won medals during this game.") }}
    </b-row>
    <b-row v-else class="justify-content-center align-items-center w-100">
      <template v-if="cols">
        <template v-for="medalType in statsMatchingMedals" :key="medalType">
          <b-col
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
              :type="medalType"
              :medal-level-and-progress="levelsAndProgress[medalType]"
              :with-game-data="!!dataset"
              :with-details="withDetails"
            />
          </b-col>
        </template>
      </template>
      <template v-else>
        <Medal
          v-for="medalType in statsMatchingMedals"
          :key="medalType"
          :style="{ width: '2.5rem' }"
          :type="medalType"
          :medal-level-and-progress="levelsAndProgress[medalType]"
          :with-game-data="!!dataset"
          :with-details="withDetails"
          :with-title="false"
        />
      </template>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { MEDAL_LEVELS, userStore } from "~/stores/user";
import type { MedalLevelAndProgress } from "~duckguessr-types/playerStats";
import { getDuckguessrId } from "~/composables/user";
import type { dataset, userMedalPoints } from "~duckguessr-prisma-client";
import type { ColsNumbers } from "bootstrap-vue-next";

const DATASET_WITH_MEDALS: string[] = ["published-fr-recent", "it", "us"];

const { t } = useI18n();
const duckguessrId = getDuckguessrId();

const {
  dataset = null,
  statsOverride = null,
  cols = null,
  colsLg = 3,
} = defineProps<{
  dataset?: dataset | null;
  withDetails: boolean;
  statsOverride?: userMedalPoints[] | null;
  cols?: ColsNumbers;
  colsLg?: ColsNumbers;
}>();

const stats = computed(() =>
  dataset ? userStore().gameStats : statsOverride || userStore().stats,
);

const statsMatchingMedals = computed(() =>
  stats.value
    ?.filter(
      ({ medalType, playerId, playerPoints }) =>
        playerPoints! > 0 &&
        (statsOverride || duckguessrId === playerId) &&
        (/^(ultra_)?fast/.test(medalType) ||
          !dataset ||
          DATASET_WITH_MEDALS.includes(dataset.name)),
    )
    ?.map(({ medalType }) => medalType),
);

const levelsAndProgress = computed(
  (): Record<string, MedalLevelAndProgress> =>
    !stats.value
      ? {}
      : MEDAL_LEVELS.reduce((acc, { medalType, levels }) => {
          let level =
            levels.length -
            [...levels]!.reverse().findIndex(
              (levelThreshold: number) =>
                (
                  stats.value!.find(
                    ({ medalType: statsMedalType }) =>
                      medalType === statsMedalType,
                  ) || {
                    points: 0,
                  }
                ).playerPoints! >= levelThreshold,
            );

          if (level === 4) {
            level = 0;
          }
          if (level === 3) {
            return {
              ...acc,
              [medalType]: {
                level,
                currentLevelPoints: 0,
                currentLevelPercentageProgress: 0,
              },
            };
          }
          const currentLevelThreshold = level === 0 ? 0 : levels[level - 1];
          const currentLevelPoints =
            (
              stats.value!.find(
                ({ medalType: statsMedalType }) => medalType === statsMedalType,
              ) || {
                playerPoints: 0,
              }
            ).playerPoints! - currentLevelThreshold;
          const currentLevelProgressPoints = userStore().gameStats
            ? (
                userStore().gameStats!.find(
                  ({ medalType: statsMedalType }) =>
                    medalType === statsMedalType,
                ) || {
                  playerPoints: 0,
                }
              ).playerPoints
            : 0;

          const medalLevelAndProgress = {
            level,
            currentLevelPoints,
            currentLevelProgressPoints,
          };
          return {
            ...acc,
            [medalType]: medalLevelAndProgress,
          };
        }, {}),
);

const noMedalProgress = computed(
  () =>
    levelsAndProgress.value &&
    !Object.values(levelsAndProgress.value).some(
      ({ currentLevelProgressPoints }) => currentLevelProgressPoints > 0,
    ),
);
</script>

<style scoped lang="scss"></style>
