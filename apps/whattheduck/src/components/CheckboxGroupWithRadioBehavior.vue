<template>
  <ion-radio-group v-model="id" :class="class">
    <ion-checkbox
      v-for="item of list"
      label-placement="start"
      justify="end"
      :checked="id === getItemId(item)"
      :color="getCheckboxColor ? getCheckboxColor(item) : undefined"
      @ion-change="
        onChange($event, () => {
          id = getItemId(item);
        })
      "
      class="ion-text-right ion-padding-bottom"
    >
      <slot :item="item" />
    </ion-checkbox>
  </ion-radio-group>
</template>
<script setup lang="ts" generic="Id extends string | number | null, Item extends object">
import { IonCheckbox } from '@ionic/vue';

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

const onChange = (event: Event & { detail: { checked: boolean } }, callback: () => void) => {
  if (event.detail.checked) {
    callback();
  } else {
    event.preventDefault();
  }
};
</script>
