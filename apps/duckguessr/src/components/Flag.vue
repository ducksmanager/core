<template>
  <b-img :class="{ invisible: !isShown }" :src="url" @error="isShown = false" />
</template>

<script setup lang="ts">
const { country } = defineProps<{
  country: string;
}>();
const fixedCountry = ref(country);
switch (country) {
  case "uk":
    fixedCountry.value = "gb";
}
const url = computed(() => `https://flagcdn.com/w20/${fixedCountry.value}.png`);
const isShown = ref(true);
</script>
