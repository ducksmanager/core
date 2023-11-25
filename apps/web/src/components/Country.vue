<template>
  <span>
    <img
      class="flag"
      :alt="country || undefined"
      :src="getImagePath(`flags/${country}.png`)"
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

const { getImagePath } = images();
</script>

<style scoped>
.flag {
  margin-bottom: 5px;
}
</style>
