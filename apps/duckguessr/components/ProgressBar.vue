<template>
  <b-progress :variant="progressbarVariant">
    <div class="position-absolute pt-2 w-100 progress-text">
      <template v-if="remainingTime && remainingTime !== Math.Infinity">
        {{ t('Guess the author!') }} ({{ remainingTime }})
      </template>
    </div>
    <b-progress-bar animated :value="remainingTime * (100 / availableTime)" />
  </b-progress>
</template>

<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'
const progressbarProps = defineProps<{
  availableTime: number
  remainingTime: number
}>()

const remainingTimePercentage =
  progressbarProps.remainingTime * (100 / progressbarProps.availableTime)

let progressbarVariant
if (remainingTimePercentage <= 20) {
  progressbarVariant = 'danger'
} else if (remainingTimePercentage <= 40) {
  progressbarVariant = 'warning'
} else {
  progressbarVariant = 'success'
}
const { t } = useI18n()
</script>

<style scoped lang="scss">
.progress-text {
  left: 0;
}
</style>
