<template>
  <ion-item button :class="{ 'is-next-owned': isNextOwned, 'is-owned': fillPercentage }">
    <ion-progress-bar v-if="fillPercentage" :value="fillPercentage" />
    <slot name="checkbox" />
    <ion-label class="text">
      <slot name="prefix" />
      <slot name="label" />
    </ion-label>
    <ion-label slot="end" class="suffix">
      <slot name="suffix" />
    </ion-label>
  </ion-item>
</template>

<script setup lang="ts">
defineProps<{
  fillPercentage?: number;
  isNextOwned?: boolean;
}>();
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
      width: 2px;
      margin-left: 6px;
      height: 54%;
      content: ' ';
      background: linear-gradient(0deg, rgb(255, 0, 0) 0%, rgb(0, 255, 0) 100%);
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
  &.suffix {
    color: grey;
  }
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
