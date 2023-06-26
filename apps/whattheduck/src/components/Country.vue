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
