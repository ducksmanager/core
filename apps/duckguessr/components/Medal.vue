<template>
  <div :style="{ backgroundImage: `url('/medals/256px/${fileName}'` }" />
</template>

<script setup lang="ts">
import { computed } from '@nuxtjs/composition-api'

const props = defineProps({
  type: { type: String, required: true },
  level: { type: Number, required: true, validator: (prop: number) => [1, 2, 3].includes(prop) },
})

const fileName = computed(
  () => `${props.type} ${props.level === 1 ? 'BRONZE' : props.level === 2 ? 'ARGENT' : 'OR'}.png`
)
</script>

<style scoped>
div {
  width: 256px;
  height: 256px;
  background-size: cover;
}
</style>
