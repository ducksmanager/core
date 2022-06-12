<template>
  <b-modal visible :body-bg-variant="status" hide-footer hide-header-close no-close-on-backdrop>
    <template #modal-title> Round {{ roundNumber }} </template>
    <div v-if="status === 'success'">
      <div class="font-weight-bold">{{ t('Correct!') }}</div>
      <div v-if="speedBonus" class="my-3">
        <b-icon-stopwatch-fill />&nbsp;{{ t('Speed bonus') }}: {{ speedBonus }}
      </div>
    </div>
    <div v-else>{{ t('Incorrect.') }}</div>
    <div class="my-3">
      <div>{{ t('The answer was:') }}</div>
      <b-row class="justify-content-center">
        <author-card :enabled="true" :selectable="false" :author="correctAuthor" />
      </b-row>
    </div>
    <div v-if="initialTimeBeforeNextRound && timeBeforeNextRound" class="text-center">
      <div>{{ t('Round {roundNumber} starts in...', { roundNumber: roundNumber + 1 }) }}</div>
      <circle-progress-bar :total="initialTimeBeforeNextRound" :remaining="timeBeforeNextRound" />
    </div>
    <div v-else-if="!hasEverybodyGuessed && timeBeforeNextRound === null" class="text-center">
      <div>{{ t('Waiting for the other players to play...') }}</div>
    </div>
  </b-modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from '@nuxtjs/composition-api'
import { BIconStopwatchFill } from 'bootstrap-vue'
import { useI18n } from 'nuxt-i18n-composable'
import { defineEmits } from '@vue/runtime-dom'
import { Author } from '~/types/roundWithScoresAndAuthor'

const props = defineProps<{
  status: String
  roundNumber: Number
  correctAuthor: Author
  speedBonus: Number | null
  nextRoundStartDate: Date | null
  hasEverybodyGuessed: boolean
}>()

const nextRoundStartTime = computed(() => props.nextRoundStartDate?.getTime())
const time = new Date().getTime()
const initialTimeBeforeNextRound = computed(() =>
  nextRoundStartTime.value ? nextRoundStartTime.value - time : null
)
const timeBeforeNextRound = ref(null as number | null)

const emit = defineEmits(['next-round'])

const { t } = useI18n()

const updateTimeBeforeNextRound = () => {
  timeBeforeNextRound.value =
    props.nextRoundStartDate === null
      ? null
      : Math.ceil((props.nextRoundStartDate.getTime() - new Date().getTime()) / 1000)
}

onMounted(() => {
  setInterval(updateTimeBeforeNextRound, 1000)
})

updateTimeBeforeNextRound()

watch(
  () => timeBeforeNextRound.value,
  (timeBeforeNextRound: number | null) => {
    if (timeBeforeNextRound! <= 0) {
      emit('next-round')
    }
  }
)
</script>

<style scoped lang="scss">
::v-deep .modal-body {
  &.bg-success {
    background-color: #52a350 !important;
  }
  color: white;
  text-align: center;

  .author {
    background-color: white;
    height: 150px;
  }
}
</style>
