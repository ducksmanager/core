<template>
  <span
    :class="{ [size]: true, [displayClass]: true }"
    class="align-items-center"
  >
    <img :alt="countrycode" :src="getImagePath(`flags/${countrycode}.png`)" />
    <span class="mx-1">{{ publicationname }}</span>
    <slot />
  </span>
</template>

<script setup lang="ts">
const {
  publicationcode,
  size = "md",
  displayClass = "d-inline-flex",
} = defineProps<{
  publicationcode: string;
  publicationname: string;
  size?: string;
  displayClass?: string;
}>();

const { getImagePath } = images();

const countrycode = $computed(() => publicationcode.split("/")[0]);
</script>

<style scoped lang="scss">
span.xl {
  font-size: 15pt;
  font-weight: bold;
}
</style>
