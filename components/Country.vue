<template>
  <span>
    <img
      class="flag"
      :alt="countryCode"
      :src="`${imagePath}/flags/${countryCode}.png`"
    />&nbsp;
    <slot v-if="countryName" :country-name="countryName">
      {{ countryName }}
    </slot>
  </span>
</template>

<script setup>
const { country, publicationCode } = defineProps({
  country: {
    type: String,
    default: null,
  },
  publicationCode: {
    type: String,
    default: null,
  },
  countryName: {
    type: String,
    default: null,
  },
});

const countryCode = $computed(() => country || publicationCode.split("/")[0]);
</script>

<style scoped>
.flag {
  margin-bottom: 5px;
}
</style>
