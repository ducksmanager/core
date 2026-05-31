<template>
  <span :class="`flag flag-${id}`" :title="id" :aria-label="id" :style="style" />
  <template v-if="label">{{ label }}</template>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  label?: string;
  style?: string;
}>();
</script>

<style lang="scss" scoped>
.flag {
  display: inline-block;
}
</style>
