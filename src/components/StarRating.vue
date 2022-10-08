<template>
  <div @mouseout="currentRating=rating">
    <span
      v-for="index in maxRating"
      :key="index"
      @mouseover="currentRating = index"
      @click="emit('update:rating', currentRating)"
    >
      <BIconStarFill v-if="index <= currentRating" />
      <BIconStar v-else />
    </span>
  </div>
</template>

<script setup>
import { BIconStar, BIconStarFill } from "bootstrap-icons-vue";
const props = defineProps({ rating: Number, maxRating: Number });
const emit = defineEmits(["update:rating"]);

const currentRating = $ref(props.rating);
</script>

<style scoped lang="scss">
span {
  cursor: pointer;

  svg {
    fill: #ffc107;
  }
}
</style>
