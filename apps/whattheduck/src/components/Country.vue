<template>
  <img :src="`/icons/flags_${key}.png`" :alt="key" />
  {{ label }}
</template>

<script setup lang="ts">
defineProps<{
  key: string;
  label: string;
}>();
</script>

<style lang="scss" scoped>
img {
  width: 18px;
  margin-right: 1rem;
}
</style>