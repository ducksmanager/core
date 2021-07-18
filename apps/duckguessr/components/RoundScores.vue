<template>
  <div>
    <h5 :key="`round-score-title-${roundNumber}`">
      Round {{ roundNumber + 1 }}
    </h5>
    <div
      v-for="(userScores, username) in scoresPerPlayer"
      :key="`score-${username}`"
      class="border p-2 m-2"
    >
      <h5>{{ username }}</h5>
      <template v-if="userScores">
        <div
          v-for="(score, reason) in userScores"
          :key="`score-${username}-${reason}`"
        >
          <h6>{{ reason }}</h6>
          <div>{{ score }} points</div>
        </div>
      </template>
      <div v-else>0 point</div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'RoundScores',
  props: {
    scores: {
      type: Array,
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
  },
  setup({ scores }) {
    const scoresPerPlayer = scores.reduce(
      (acc, value) => ({
        ...acc,
        [value.players.username]: {
          ...(acc[value.players.username] || {}),
          [value.score_type_name]: value.score,
        },
      }),
      []
    )
    return {
      scoresPerPlayer,
      totalScorePerPlayer: computed(() =>
        Object.keys(scoresPerPlayer).reduce(
          (acc, username) => ({
            ...acc,
            [username]:
              (acc[username] || 0) +
              Object.values(scoresPerPlayer[username]).reduce(
                (acc, score) => acc + score,
                0
              ),
          }),
          {}
        )
      ),
    }
  },
})
</script>

<style scoped></style>
