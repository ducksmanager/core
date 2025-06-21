<template>
  <b-progress :variant="progressbarVariant">
    <div class="position-absolute pt-2 w-100 progress-text">
      <template v-if="remainingTime && remainingTime !== Infinity">
        {{ t("Guess the author!") }} ({{ remainingTime }})
      </template>
    </div>
    <b-progress-bar animated :value="remainingTime * (100 / availableTime)" />
  </b-progress>
</template>

<script setup lang="ts">
const { availableTime, remainingTime } =
  toRefs(
    defineProps<{
      availableTime: number;
      remainingTime: number;
    }>(),
  );

const remainingTimePercentage = computed(
  () => remainingTime.value * (100 / availableTime.value),
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
