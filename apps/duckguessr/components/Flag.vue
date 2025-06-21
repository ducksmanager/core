<template>
  <b-img :class="{ invisible: !isShown }" :src="url" @error="isShown = false" />
</template>

<script setup lang="ts">
import { computed, ref } from '@nuxtjs/composition-api'

const props = defineProps<{
  country: string
}>()
const fixedCountry = ref(props.country)
switch (props.country) {
  case 'uk':
    fixedCountry.value = 'gb'
}
const url = computed(() => `https://flagcdn.com/w20/${fixedCountry.value}.png`)
const isShown = true
</script>

<style scoped></style>
