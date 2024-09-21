<template>
  <ion-item
    :button="!isOfflineMode"
    :class="class"
    @click="selectedIssuecodes ? toggleCheckedIssuecode(id) : goToItem()"
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

const toggleCheckedIssuecode = (issuecode: string) => {
  selectedIssuecodes.value = toggleElement(selectedIssuecodes.value!, issuecode);
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
