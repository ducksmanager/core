<template>
  <span>
    <img
      class="flag"
      :alt="countryCode || undefined"
      :src="`/images/flags/${countryCode}.png`"
    />&nbsp;
    <slot v-if="countryName" :country-name="countryName">
      {{ countryName }}
    </slot>
  </span>
</template>

<script setup lang="ts">
const { country = null, countryName = null } = defineProps<{
  country?: string;
  countryName?: string;
}>();

const countryCode = $computed(() => country);
</script>

<style scoped>
.flag {
  margin-bottom: 5px;
}
</style>
