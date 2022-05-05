<template>
  <div class="position-relative medal" :style="{ backgroundImage: medalUrl }">
    <div
      class="position-absolute overlay"
      :style="{
        backgroundImage: medalUrl,
        width: `${100 - levelPercentage - currentLevelPercentageProgress}%`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from '@nuxtjs/composition-api'

const props = defineProps({
  type: { type: String, required: true },
  level: { type: Number, required: true, validator: (prop: number) => [1, 2, 3].includes(prop) },
  levelPercentage: { type: Number, default: 100 },
  levelPercentageProgress: { type: Number, default: 0 },
})

const currentLevelPercentageProgress = ref(0)
const currentLevelPercentageProgressGoingUp = ref(true)

const fileName = computed(
  () => `${props.type} ${props.level === 1 ? 'BRONZE' : props.level === 2 ? 'ARGENT' : 'OR'}.png`
)

const medalUrl = computed(() => `url('/medals/256px/${fileName.value}'`)

if (props.levelPercentageProgress) {
  onMounted(() => {
    setInterval(() => {
      const increment = props.levelPercentageProgress / 20
      if (
        currentLevelPercentageProgress.value < 0 ||
        currentLevelPercentageProgress.value >= props.levelPercentageProgress
      ) {
        currentLevelPercentageProgressGoingUp.value = !currentLevelPercentageProgressGoingUp.value
      }
      currentLevelPercentageProgress.value +=
        increment * (currentLevelPercentageProgressGoingUp.value ? 1 : -1)
    }, 50)
  })
}
</script>

<style scoped lang="scss">
.medal {
  width: 256px;
  height: 256px;
  background-size: cover;
}
.overlay {
  height: 100%;
  filter: saturate(0%);
  background-position-x: right;
  right: 0;
}
</style>
