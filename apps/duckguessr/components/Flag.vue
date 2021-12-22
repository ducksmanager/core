<template>
  <b-img :src="url" />
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
</script>

<style scoped></style>
