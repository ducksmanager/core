<template>
  <div>
    <h5>{{ totalScore }} points</h5>
    <div
      v-for="(score, score_type_name) in scores"
      :key="`score-${score_type_name}`"
    >
      <h6>{{ score_type_name }}</h6>
      <div>{{ score }} points</div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'RoundScores',
  props: {
    scores: {
      type: Object,
      required: true,
    },
  },

  setup({ scores }) {
    return {
      totalScore: Object.values(scores).reduce((acc, score) => acc + score, 0),
    }
  },
})
</script>

<style scoped></style>
