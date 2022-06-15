<template>
  <b-modal
    visible
    hide-footer
    hide-header-close
    no-close-on-backdrop
    body-bg-variant="secondary"
    body-class="d-flex flex-column text-white"
  >
    <template #modal-title> The game is about to start! </template>
    <div>
      During each round, be the fastest to guess which of these artists drew the drawing shown on
      the screen.
    </div>
    <b-row id="author-list" class="my-2">
      <author-card
        v-for="(author, idx) in authors"
        :key="`author-${idx}`"
        :author="author"
        :enabled="true"
        :selectable="false"
      />
    </b-row>
    <div class="text-center">
      <div>{{ t('Round {roundNumber} starts in...', { roundNumber: 1 }) }}</div>
      <circle-progress-bar :total="initialTimeBeforeFirstRound" :remaining="timeBeforeFirstRound" />
    </div>
  </b-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { Author } from '~/types/roundWithScoresAndAuthor'

const props = defineProps<{
  authors: Author[]
  firstRoundStartDate: Date
}>()

const timeBeforeFirstRound = ref(null as number | null)

const { t } = useI18n()

const updateTimeBeforeNextRound = () => {
  const time = new Date().getTime()
  timeBeforeFirstRound.value = Math.max(
    0,
    Math.ceil((new Date(props.firstRoundStartDate).getTime() - time) / 1000)
  )
}

onMounted(() => {
  setInterval(updateTimeBeforeNextRound, 1000)
})

updateTimeBeforeNextRound()

const initialTimeBeforeFirstRound = timeBeforeFirstRound.value
</script>

<style scoped lang="scss">
::v-deep .modal-dialog {
  height: calc(100% - 60px);

  .modal-content {
    height: 100%;
    #author-list {
      @media (max-width: 992px) {
        height: 100%;
      }

      .author-image {
        height: 100%;
      }
    }
  }
}
</style>
