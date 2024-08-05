<template>
  <ion-icon :class="{ indicator: isIndicator }" :ios="ios" :md="md" :style="color ? { color } : undefined" />
  <hr v-if="negate" class="negate" />
</template>
<script setup lang="ts">
import type { Option } from '~/stores/app';

type IconOrUndefined = Option['icon'];
// Prevents Unresolvable type reference or unsupported built-in utility type
// when doing type Icon = NonNullable<IconOrUndefined>
interface Icon {
  ios: NonNullable<IconOrUndefined>['ios'];
  md: NonNullable<IconOrUndefined>['md'];
  color?: NonNullable<IconOrUndefined>['color'];
  negate?: NonNullable<IconOrUndefined>['negate'];
}
withDefaults(defineProps<Icon & { isIndicator?: boolean }>(), {
  isIndicator: false,
});
</script>
<style scoped lang="scss">
hr {
  &.negate {
    position: absolute;
    width: 100%;
    transform: rotate(-40deg);
    border-top: 1px solid white !important;
  }
}

ion-icon.indicator {
  background-color: darkgray;
  border-radius: 1rem;
  position: absolute;
  bottom: 0;
  right: 0.5rem;
  font-size: 1rem;
  margin-left: 0.5rem;
}
</style>
