<template>
  <b-modal visible :body-bg-variant="status" hide-footer hide-header-close>
    <template #modal-title> Round {{ userRoundNumber }} </template>
    <div v-if="status === 'success'">Correct!</div>
    <div v-else-if="status === 'warning'">
      Incorrect, but you got the author's country correct.
    </div>
    <div v-else>Incorrect</div>
    <template v-if="timeBeforeNextRound">
      <div>Round {{ userRoundNumber + 1 }} starts in</div>
      <div class="text-xl-center">
        {{ timeBeforeNextRound }}
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'RoundResultModal',
  props: {
    status: {
      type: String,
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    nextRoundStartDate: {
      type: Date,
      default: null,
    },
  },
  setup({ roundNumber, nextRoundStartDate }, { emit }) {
    const timeBeforeNextRound = ref(null as Number | null)
    const userRoundNumber = roundNumber + 1

    const updateTimeBeforeNextRound = () => {
      timeBeforeNextRound.value = Math.ceil(
        (nextRoundStartDate.getTime() - new Date().getTime()) / 1000
      )
    }

    onMounted(() => {
      setInterval(updateTimeBeforeNextRound, 1000)
    })

    watch(
      () => timeBeforeNextRound.value,
      (timeBeforeNextRound: Number | null) => {
        if (timeBeforeNextRound! <= 0) {
          emit('next-round')
        }
      }
    )

    return {
      userRoundNumber,
      timeBeforeNextRound,
    }
  },
})
</script>

<style scoped lang="scss">
.modal-dialog {
  max-width: 100%;
  margin: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  display: flex;
}
</style>
