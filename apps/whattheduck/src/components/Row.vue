<template>
  <ion-item
    :button="!isOfflineMode"
    :class="{ [`next-item-${nextItemType}`]: !!nextItemType, 'is-owned': isOwned }"
    v-on-long-press.prevent="[onLongPress, onLongPressOptions]"
  >
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
import { vOnLongPress } from '@vueuse/components';

import { app } from '~/stores/app';

const props = defineProps<{
  isOwned?: boolean;
  id: string;
  keyInList: string;
  nextItemType?: 'same' | 'owned';
}>();

defineSlots<{
  'fill-bar'(): any;
  'checkbox'(): any;
  'prefix'(): any;
  'label'(): any;
  'suffix'(): any;
}>();

const { isOfflineMode, selectedIssuenumbers, allowMultipleSelection, currentNavigationItem } = storeToRefs(app());

const onLongPress = () => {
  if (allowMultipleSelection.value) {
    selectedIssuenumbers.value = [];
    toggleCheckedIssuenumber(props.keyInList);
  } else {
    currentNavigationItem.value = props.id;
  }
};

const onLongPressOptions = {
  delay: 500,
  onMouseUp: (_: number, __: number, isLongPress: boolean) => {
    if (!isLongPress) {
      if (allowMultipleSelection.value && selectedIssuenumbers.value !== null) {
        toggleCheckedIssuenumber(props.keyInList);
      } else {
        currentNavigationItem.value = props.id;
      }
    }
  },
};

const toggleElement = <T,>(arr: T[], element: T): T[] =>
  arr.includes(element) ? arr.filter((el) => el !== element) : [...arr, element];

const toggleCheckedIssuenumber = (issuenumber: string) => {
  selectedIssuenumbers.value = toggleElement(selectedIssuenumbers.value!, issuenumber);
};
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
    align-items: center;
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
