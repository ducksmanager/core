<template>
  <div @mouseout="currentRating = rating">
    <span
      v-for="index in maxRating"
      :key="index"
      @mouseover="currentRating = index"
      @click="emit('update:rating', currentRating)"
    >
      <b-icon-star-fill v-if="index <= currentRating" />
      <b-icon-star v-else />
    </span>
  </div>
</template>

<script setup lang="ts">
import { BIconStar, BIconStarFill } from "bootstrap-icons-vue";
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
