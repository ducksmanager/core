<template>
  <span>
    <img
      class="flag"
      :alt="countryCode || undefined"
      :src="getImagePath(`flags/${countryCode}.png`)"
    />&nbsp;
    <slot v-if="countryName" :country-name="countryName">
      {{ countryName }}
    </slot>
  </span>
</template>

<script setup lang="ts">
import { images } from "~/stores/images";

const { country = null, countryName = null } = defineProps<{
  country?: string;
  countryName?: string;
}>();

const getImagePath = images().getImagePath;
const countryCode = $computed(() => country);
</script>

<style scoped>
.flag {
  margin-bottom: 5px;
}
</style>
