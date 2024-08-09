<template>
  <ion-icon :class="{ indicator: isIndicator }" :ios="ios" :md="md" />
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
    transform: rotate(-45deg);
    border-top: 1px solid red !important;
  }
}

ion-icon.indicator {
  background-color: darkgray;
  border-radius: 1rem;
  position: absolute;
  bottom: 0;
  right: 0.5rem;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  padding: 1px;

  + hr.negate {
    bottom: -1px;
    right: 8px;
    width: 14px;
  }
}
</style>
