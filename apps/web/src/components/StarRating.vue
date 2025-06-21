<template>
  <div :class="{ readonly }" @mouseout="currentRating = rating">
    <span
      v-for="index in maxRating"
      :key="index"
      @mouseover="currentRating = index"
      @click="
        currentRating = index;
        emit('update:rating', currentRating);
      "
      ><slot v-if="index <= currentRating" name="emptyStarIcon" />
      <slot v-else name="filledStarIcon"></slot>
    </span>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "StarRating",
});
</script>
<script setup lang="ts">
const { rating } = defineProps<{
  rating: number;
  maxRating: number;
  readonly: boolean;
}>();
const emit = defineEmits<{
  (e: "update:rating", currentRating: number): void;
}>();

defineSlots<{
  filledStarIcon: void;
  emptyStarIcon: void;
}>();

const currentRating = ref(rating);
</script>

<style scoped lang="scss">
div {
  &.readonly {
    pointer-events: none;
  }
  span {
    cursor: pointer;

    svg {
      fill: #ffc107;
    }
  }
}
</style>
