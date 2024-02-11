<template>
  <svg class="stat-circle" width="50" viewBox="0 0 20 20">
    <circle class="bg" cx="10" cy="10" r="8" />
    <circle
      class="progress"
      cx="10"
      cy="10"
      r="8"
      :style="{ 'stroke-dashoffset': `${offset}px` }"
    />
    <text x="50%" y="55%">{{ remaining }}</text>
  </svg>
</template>

<script setup lang="ts">
const { total, remaining } =
  toRefs(
    defineProps<{
      total: number;
      remaining: number;
    }>(),
  );

const percentage = computed(() =>
  Math.max(0, parseInt((100 * (remaining.value / total.value)).toFixed(0))),
);
const offset = computed(() => -51 - (51 / 100) * percentage.value);
</script>

<style scoped lang="scss">
.stat-circle {
  circle.bg {
    fill: none;
    stroke: #f1f1f1;
    stroke-width: 2;
  }
  circle.progress {
    fill: none;
    stroke: grey;
    stroke-width: 2;
    stroke-dasharray: 51 51;
    stroke-linecap: round;
  }
  text {
    font-size: 4.5px;
    text-anchor: middle;
    fill: white;
  }
}
</style>
