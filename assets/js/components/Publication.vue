<template>
  <span :class="{ [size]: true }">
    <img :alt="countrycode" :src="`${imagePath}/flags/${countrycode}.png`" />
    {{ publicationname }}
  </span>
</template>

<script setup>
import { imagePath } from "../composables/imagePath";
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
