<template>
  <b-progress :variant="progressbarVariant">
    <div class="position-absolute pt-2 w-100">
      <template v-if="remainingTime"> Guess the author! ({{ remainingTime }}) </template>
    </div>
    <b-progress-bar animated :value="remainingTime * (100 / availableTime)" />
  </b-progress>
</template>

<script setup lang="ts">
const props2 = defineProps<{
  availableTime: number
  remainingTime: number
}>()

const remainingTimePercentage = props2.remainingTime * (100 / props2.availableTime)

let progressbarVariant
if (remainingTimePercentage <= 20) {
  progressbarVariant = 'danger'
} else if (remainingTimePercentage <= 40) {
  progressbarVariant = 'warning'
} else {
  progressbarVariant = 'success'
}
</script>

<style scoped></style>
