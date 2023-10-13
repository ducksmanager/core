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
@import '../theme/variables.scss';

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
      height: 50%;
      content: ' ';
    }

    :deep(.dm-condition-background) {
      @each $condition, $conditionColor in $dmConditions {
        &.#{$condition}::after {
          background: $conditionColor;
        }
      }
      &::after {
        bottom: 0;
      }
    }

    + ion-item {
      :deep(.dm-condition-background) {
        @each $condition, $conditionColor in $dmConditions {
          &.#{$condition}::before {
            background: $conditionColor;
          }
        }
        &::before {
          top: 0;
        }
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
