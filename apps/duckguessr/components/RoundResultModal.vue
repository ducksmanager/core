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
        <author-card selectable :author="correctAuthor" />
      </b-row>
    </div>
    <div v-if="timeBeforeNextRound" class="text-center">
      <div>{{ t('Round {roundNumber} starts in...', { roundNumber: roundNumber + 1 }) }}</div>
      <circle-progress-bar :total="initialTimeBeforeNextRound" :remaining="timeBeforeNextRound" />
    </div>
    <div v-else-if="timeBeforeNextRound === null" class="text-center">
      <div>{{ t('Waiting for all other players to guess the last round...') }}</div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@nuxtjs/composition-api'
import { BIconStopwatchFill } from 'bootstrap-vue'
import { useI18n } from 'nuxt-i18n-composable'
import { Author } from '~/types/roundWithScoresAndAuthor'

export default defineComponent({
  name: 'RoundResultModal',
  components: {
    BIconStopwatchFill,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    correctAuthor: {
      type: Object as () => Author,
      required: true,
    },
    speedBonus: {
      type: Number,
      default: null,
    },
    nextRoundStartDate: {
      type: Date,
      default: null,
    },
  },
  setup({ nextRoundStartDate }, { emit }) {
    const { t } = useI18n()

    const getTimeBeforeNextRound = () =>
      Math.ceil((nextRoundStartDate.getTime() - new Date().getTime()) / 1000)

    const updateTimeBeforeNextRound = () => {
      timeBeforeNextRound.value = nextRoundStartDate === null ? null : getTimeBeforeNextRound()
    }

    onMounted(() => {
      setInterval(updateTimeBeforeNextRound, 1000)
    })

    const timeBeforeNextRound = ref(null as number | null)
    updateTimeBeforeNextRound()
    const initialTimeBeforeNextRound = timeBeforeNextRound.value

    watch(
      () => timeBeforeNextRound.value,
      (timeBeforeNextRound: number | null) => {
        if (timeBeforeNextRound! <= 0) {
          emit('next-round')
        }
      }
    )

    return {
      t,
      initialTimeBeforeNextRound,
      timeBeforeNextRound,
    }
  },
})
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
