<template>
  <b-img :class="{ invisible: !isShown }" :src="url" @error="isShown = false" />
</template>

<script setup lang="ts">
const { country } = toRefs(
  defineProps<{
    country: string;
  }>()
);
const fixedCountry = ref(country.value);
switch (country.value) {
  case "uk":
    fixedCountry.value = "gb";
}
const url = computed(() => `https://flagcdn.com/w20/${fixedCountry.value}.png`);
const isShown = ref(true);
</script>

<style scoped></style>
