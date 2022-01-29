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

<script setup lang="ts">
const { scores } = defineProps<{
  scores: number[]
}>()

const totalScore = (Object.values(scores) as number[]).reduce(
  (acc, score) => acc + score,
  0
)
</script>

<style scoped></style>
