<template>
  <div @mouseout="currentRating = rating">
    <span
      v-for="index in maxRating"
      :key="index"
      @mouseover="currentRating = index"
      @click="emit('update:rating', currentRating)"
    >
      <i-bi-star-fill v-if="index <= currentRating" />
      <i-bi-star v-else />
    </span>
  </div>
</template>

<script setup lang="ts">
const { rating } = defineProps<{
  rating: number;
  maxRating: number;
}>();
const emit = defineEmits<{
  (e: "update:rating", currentRating: number): void;
}>();

const currentRating = $ref(rating);
</script>

<style scoped lang="scss">
span {
  cursor: pointer;

  svg {
    fill: #ffc107;
  }
}
</style>
