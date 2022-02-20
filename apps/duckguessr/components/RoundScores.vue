<template>
  <div>
    <div v-for="(score, score_type_name) in scores" :key="`score-${score_type_name}`">
      <h6>{{ score_type_name }}</h6>
      <div>{{ score }} points</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  scores: { [key: string]: number }
}>()
</script>

<style scoped></style>
