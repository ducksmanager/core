<template>
  <ion-radio-group v-model="id" :class="class">
    <ion-radio
      v-for="item of list"
      label-placement="start"
      justify="end"
      :disabled="isOfflineMode"
      :checked="id === getItemId(item)"
      :color="getCheckboxColor ? getCheckboxColor(item) : undefined"
      class="ion-text-right ion-padding-bottom"
    >
      <slot :item="item" />
    </ion-radio>
  </ion-radio-group>
</template>
<script setup lang="ts" generic="Id extends string | number | null, Item extends object">
import { app } from '~/stores/app';

const id = defineModel<Id>('id', {
  required: true,
});

defineProps<{
  list: Item[];
  getItemId: (item: Item) => Id;
  getCheckboxColor?: (item: Item) => string;
  class?: string;
}>();

defineSlots<{
  default: (value: { item: Item }) => void;
}>();

const { isOfflineMode } = storeToRefs(app());
</script>
