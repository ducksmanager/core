<template>
  <span :class="{ [displayClass]: true }" class="align-items-center">
    <img :alt="countrycode" :src="getFlagsPath(`${countrycode}.png`)" />
    <span class="mx-1">{{ publicationname }}</span>
    <slot />
  </span>
</template>

<script setup lang="ts">
const { publicationcode, displayClass = "d-inline-flex" } = defineProps<{
  publicationcode: string;
  publicationname: string;
  displayClass?: string;
}>();
const countrycode = computed(() => publicationcode.split("/")[0]);

const getFlagsPath = (flag: string) =>
  `${import.meta.env.VITE_FLAGS_ROOT}${flag}`;
</script>

<style scoped lang="scss">
span.xl {
  font-size: 15pt;
  font-weight: bold;
}
</style>
