<template>
  <ion-item :button="!isOfflineMode" :class="class" v-on-long-press.prevent="[onLongPress, onLongPressOptions]">
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
  id: string;
  type: 'countrycode' | 'publicationcode' | 'issuecode';
  class: Record<string, boolean> | '';
}>();

defineSlots<{
  'fill-bar'(): any;
  'checkbox'(): any;
  'prefix'(): any;
  'label'(): any;
  'suffix'(): any;
}>();

const { isOfflineMode, selectedIssuecodes, currentNavigationItem } = storeToRefs(app());

const allowMultipleSelection = computed(() => props.type === 'issuecode');

const onLongPress = () => {
  if (allowMultipleSelection.value) {
    selectedIssuecodes.value = [];
    toggleCheckedIssuecode(props.id!);
  } else {
    goToItem();
  }
};

const onLongPressOptions = {
  delay: 500,
  onMouseUp: (_: number, __: number, isLongPress: boolean) => {
    if (!isLongPress) {
      if (allowMultipleSelection.value && selectedIssuecodes.value !== null) {
        toggleCheckedIssuecode(props.id!);
      } else {
        goToItem();
      }
    }
  },
};

const goToItem = () => {
  switch (props.type) {
    case 'countrycode':
    case 'publicationcode':
      currentNavigationItem.value = { type: props.type, value: props.id };
      break;
    case 'issuecode':
      currentNavigationItem.value = { type: 'issuecodes', value: [props.id] };
      break;
  }
};

const toggleElement = <T,>(arr: T[], element: T): T[] =>
  arr.includes(element) ? arr.filter((el) => el !== element) : [...arr, element];

const toggleCheckedIssuecode = (issuenumber: string) => {
  selectedIssuecodes.value = toggleElement(selectedIssuecodes.value!, issuenumber);
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
