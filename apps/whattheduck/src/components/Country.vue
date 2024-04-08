<template>
  <img :src="`/icons/flags_${id}.png`" :alt="id" />
  {{ label }}
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
}>();
</script>

<style lang="scss" scoped>
img {
  width: 18px;
  height: 18px;
}
</style>
