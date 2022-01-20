<template>
  <b-img :class="{ invisible: !isShown }" :src="url" @error="isShown = false" />
</template>

<script setup lang="ts">
const { country } = defineProps<{
  country: string
}>()
let fixedCountry = country
switch (country) {
  case 'uk':
    fixedCountry = 'gb'
}
const url = `https://flagcdn.com/w20/${fixedCountry}.png`
const isShown = true
</script>

<style scoped></style>
