<template>
  <span>
    <img
      class="flag"
      :alt="countryCode"
      :src="`/images/flags/${countryCode}.png`"
    />&nbsp;
    <slot v-if="countryName" :country-name="countryName">
      {{ countryName }}
    </slot>
  </span>
</template>

<script setup lang="ts">
const {
  country = null,
  countryName = null,
  publicationCode,
} = defineProps<{
  country: string;
  publicationCode: string;
  countryName: string;
}>();

const countryCode = $computed(() => country || publicationCode.split("/")[0]);
</script>

<style scoped>
.flag {
  margin-bottom: 5px;
}
</style>
