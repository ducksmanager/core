<template>
  <b-container v-if="levelsAndProgress" class="d-flex flex-column align-items-center">
    <b-row v-if="dataset && noMedalProgress" class="justify-content-center">
      {{ t("You haven't won medals during this game.") }}
    </b-row>
    <b-row v-else class="justify-content-center w-100">
      <template v-for="type in statsMatchingMedals">
        <b-col :key="type" class="flex-grow-0" :class="{ 'px-0': !dataset }" cols="3">
          <Medal
            :type="type"
            :medal-level-and-progress="levelsAndProgress[type]"
            :with-game-data="!!dataset"
            :with-details="withDetails"
          />
        </b-col>
      </template>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { computed } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import Index from '@prisma/client'
import { userStore } from '~/store/user'

const DATASET_WITH_MEDALS: string[] = ['published-fr-recent']

const { t } = useI18n()

const props = defineProps<{
  dataset?: Index.dataset
  withDetails: boolean
}>()

const statsToConsider = computed(() => (props.dataset ? userStore().gameStats : userStore().stats))

const statsMatchingMedals = computed(
  () =>
    statsToConsider.value &&
    (Object.keys(statsToConsider.value).reduce((acc, medalType) => {
      if (
        statsToConsider.value![medalType] &&
        (/^(ultra_)?fast/.test(medalType) ||
          !props.dataset ||
          DATASET_WITH_MEDALS.includes(props.dataset.name))
      ) {
        acc.push(medalType)
      }
      return acc
    }, [] as string[]) as string[])
)

const levelsAndProgress = computed(() => userStore().levelsAndProgress)

const noMedalProgress = computed(
  () =>
    levelsAndProgress.value &&
    !Object.values(levelsAndProgress.value).some(
      ({ currentLevelProgressPoints }) => currentLevelProgressPoints > 0
    )
)
</script>

<style scoped lang="scss"></style>
