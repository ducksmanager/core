<template>
  <ion-item button :class="{ 'is-next-owned': isNextOwned, 'is-owned': isOwned }">
    <slot name="fill-bar" />
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
  isOwned?: boolean;
  isNextOwned?: boolean;
}>();

defineSlots<{
  'fill-bar'(): any;
  'checkbox'(): any;
  'prefix'(): any;
  'label'(): any;
  'suffix'(): any;
}>();
</script>

<style lang="scss" scoped>
@import '../theme/variables.scss';

ion-item {
  --padding-start: 0;
  height: 32px;
  font-size: 0.8rem;

  &::part(native) {
    --min-height: 32px;
    // height: 32px;
  }
  ion-label {
    display: flex !important;
    margin: 0 !important;
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
}
</style>
