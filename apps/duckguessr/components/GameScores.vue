<template>
  <div>
    <h3>Scores</h3>
    <template v-for="{ round_number, round_scores } in scores">
      <round-scores
        :key="`round-score-${round_number}`"
        :round-number="round_number"
        :scores="round_scores"
      />
    </template>
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'GameScores',
  props: {
    scores: {
      type: Array,
      required: true,
    },
  },
})
</script>

<style scoped></style>
