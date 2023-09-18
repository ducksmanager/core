<template>
  <ion-item button :class="{ 'is-next-owned': isNextOwned, 'is-owned': fillPercentage }">
    <ion-progress-bar v-if="fillPercentage" :value="fillPercentage" />
    <slot name="checkbox" />
    <ion-label class="text">
      <slot name="prefix" />
      <slot name="label" />
    </ion-label>
    <ion-label v-if="ownership" slot="end">
      {{ ownershipTextFn(ownership, fillPercentage) }}
    </ion-label>
  </ion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  ownership?: [number, number];
  ownershipTextFn: (ownership: [number, number], fillPercentage?: number | undefined) => string;
  isNextOwned?: boolean;
}>();

const fillPercentage = computed(() =>
  props.ownership ? Math.max(0.1 / 100, props.ownership[0] / (props.ownership[1] || 1)) : undefined,
);
</script>

<style lang="scss" scoped>
ion-item {
  --padding-start: 0;
  ion-label {
    &:first-of-type {
      padding-left: 1rem;
    }
    // &:last-of-type {
    //   padding-right: 1rem;
    // }
    &.is-owned {
      &:first-of-type {
        font-weight: bold;
      }
    }
  }
  &.is-next-owned {
    &:deep(.dm-condition-background)::after,
    + ion-item:deep(.dm-condition-background)::before {
      position: absolute;
      width: 14px;
      font-size: 24px;
      content: 'I';
      opacity: 0.25;
      margin-left: 4px;
    }
    :deep(.dm-condition-background)::after {
      bottom: -8px;
    }

    + ion-item {
      :deep(.dm-condition-background)::before {
        top: -8px;
      }
    }
  }
}

ion-label {
  z-index: 1;
  display: flex !important;
  align-items: center !important;
}
ion-progress-bar {
  position: absolute;
  height: 100%;
  &::part(track) {
    background-color: transparent;
    opacity: 0.2;
  }
  &::part(progress) {
    height: 100%;
  }
}
</style>
