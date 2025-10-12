<template>
  <b-progress :variant="progressbarVariant" class="position-relative">
    <div class="position-absolute w-100 progress-text">
      <template v-if="remainingTime && remainingTime !== Infinity">
        {{ t("Guess the author!") }} ({{ remainingTime }})
      </template>
    </div>
    <b-progress-bar animated :value="remainingTime * (100 / availableTime)" />
  </b-progress>
</template>

<script setup lang="ts">
const { availableTime, remainingTime } = defineProps<{
  availableTime: number;
  remainingTime: number;
}>();

const remainingTimePercentage = computed(
  () => remainingTime * (100 / availableTime),
);
const progressbarVariant = computed(() => {
  if (remainingTimePercentage.value <= 20) {
    return "danger";
  } else if (remainingTimePercentage.value <= 40) {
    return "warning";
  } else {
    return "success";
  }
});
const { t } = useI18n();
</script>

<style scoped lang="scss">
.progress-text {
  left: 0;
}
</style>
