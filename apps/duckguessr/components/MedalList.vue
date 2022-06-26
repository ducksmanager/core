<template>
  <b-container v-if="levelsAndProgress" class="d-flex flex-column align-items-center">
    <b-row v-if="dataset && noMedalProgress" class="justify-content-center">
      {{ t("You haven't won medals during this game.") }}
    </b-row>
    <b-row v-else class="justify-content-center w-100">
      <template v-for="type in statsMatchingMedals">
        <b-col
          :key="type"
          class="flex-grow-0"
          :class="{
            'px-0': !dataset,
            'd-flex': withDetails,
            'justify-content-center': withDetails,
          }"
          :cols="withDetails ? 12 : 4"
          lg="4"
        >
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
import { computed, onMounted } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import Index from '@prisma/client'
import { userStore } from '~/store/user'

const DATASET_WITH_MEDALS: string[] = ['published-fr-recent']

const { t } = useI18n()

const props = defineProps<{
  dataset?: Index.dataset
  withDetails: boolean
  statsOverride?: { [key: string]: number }
}>()

const stats = computed(() => (props.dataset ? userStore().gameStats : userStore().stats))

const statsMatchingMedals = computed(
  () =>
    stats.value &&
    Object.keys(stats.value).filter(
      (medalType) =>
        stats.value![medalType] &&
        (/^(ultra_)?fast/.test(medalType) ||
          !props.dataset ||
          DATASET_WITH_MEDALS.includes(props.dataset.name))
    )
)

const levelsAndProgress = computed(() => userStore().levelsAndProgress)

const noMedalProgress = computed(
  () =>
    levelsAndProgress.value &&
    !Object.values(levelsAndProgress.value).some(
      ({ currentLevelProgressPoints }) => currentLevelProgressPoints > 0
    )
)

onMounted(() => {
  if (props.statsOverride) {
    userStore().stats = props.statsOverride
  }
})
</script>

<style scoped lang="scss"></style>
