<template>
  <b-modal visible :body-bg-variant="status" hide-footer hide-header-close>
    <template #modal-title> Round {{ roundNumber }} </template>
    <div v-if="status === 'success'">Correct!</div>
    <div v-else>Incorrect.</div>
    <div>The answer was:</div>
    <b-row><author-card selectable :author="correctAuthor" /></b-row>
    <template v-if="timeBeforeNextRound">
      <div>Round {{ roundNumber + 1 }} starts in</div>
      <div class="text-xl-center">
        {{ timeBeforeNextRound }}
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@nuxtjs/composition-api'
import { Author } from '~/types/roundWithScoresAndAuthor'

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
    correctAuthor: {
      type: Object as () => Author,
      required: true,
    },
    nextRoundStartDate: {
      type: Date,
      default: null,
    },
  },
  setup({ nextRoundStartDate }, { emit }) {
    const timeBeforeNextRound = ref(null as number | null)

    const updateTimeBeforeNextRound = () => {
      timeBeforeNextRound.value =
        nextRoundStartDate === null
          ? null
          : Math.ceil((nextRoundStartDate.getTime() - new Date().getTime()) / 1000)
    }

    onMounted(() => {
      setInterval(updateTimeBeforeNextRound, 1000)
    })

    watch(
      () => timeBeforeNextRound.value,
      (timeBeforeNextRound: number | null) => {
        if (timeBeforeNextRound! <= 0) {
          emit('next-round')
        }
      }
    )

    return {
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

  .author {
    background-color: white;
    height: 150px;
  }
}
</style>
