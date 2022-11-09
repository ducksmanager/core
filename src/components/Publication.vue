<template>
  <span :class="{ [size]: true }" class="d-inline-flex align-items-center">
    <img :alt="countrycode" :src="`/images/flags/${countrycode}.png`" />
    <span class="mx-1">{{ publicationname }}</span>
    <slot />
  </span>
</template>

<script setup>
const { publicationcode } = defineProps({
  publicationcode: {
    type: String,
    required: true,
  },
  publicationname: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "md",
  },
});
const countrycode = $computed(() => publicationcode.split("/")[0]);
</script>

<style scoped lang="scss">
span.xl {
  font-size: 15pt;
  font-weight: bold;
}
</style>
