<template>
  <span :class="{ [size]: true }">
    <img :alt="countrycode" :src="`${imagePath}/flags/${countrycode}.png`" />
    {{ publicationname }}
  </span>
</template>

<script setup>
const props = defineProps({
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
const countrycode = $computed(() => props.publicationcode.split("/")[0]);
</script>

<style scoped lang="scss">
span.xl {
  font-size: 15pt;
  font-weight: bold;
}
</style>
