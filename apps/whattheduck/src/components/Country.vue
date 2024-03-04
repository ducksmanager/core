<template>
  <img :src="`/icons/flags_${countrycode}.png`" :alt="countrycode" />
  {{ countryname }}
</template>

<script setup lang="ts">
defineProps<{
  countrycode: string;
  countryname: string;
}>();
</script>

<style lang="scss" scoped>
img {
  width: 18px;
  margin-right: 1rem;
}
</style>