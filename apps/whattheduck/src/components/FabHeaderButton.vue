<template>
  <ion-fab ref="fab" slot="fixed" vertical="top" horizontal="end">
    <ion-fab-button :disabled="disabled"><FabHeaderButtonIcon v-if="icon" v-bind="icon" /></ion-fab-button
    ><FabHeaderButtonIcon v-if="value?.icon" v-bind="value?.icon" is-indicator />
    <ion-fab-list side="bottom">
      <ion-item
        v-for="option of options"
        :key="option.id"
        :detail="false"
        button
        class="ion-align-items-center ion-text-nowrap"
        :class="{ selected: value?.id === option.id }"
        @click="
          value = option;
          (fab?.$el as HTMLIonFabElement).close();
        "
      >
        <ion-label>{{ option.label }}</ion-label>
        <ion-fab-button v-if="option.icon" size="small">
          <FabHeaderButtonIcon v-bind="option.icon" /></ion-fab-button></ion-item></ion-fab-list
  ></ion-fab>
</template>
<script setup lang="ts" generic="Item extends FabOption">
import type { FabOption } from '~/stores/app';

const fab = defineModel<ComponentPublicInstance<HTMLIonFabElement> | null>('fab');
const value = defineModel<Item>('value');
const { disabled = false } = defineProps<{
  disabled?: boolean;
  icon: { ios: string; md: string; negate?: boolean };
  options: Item[];
}>();
</script>
<style scoped lang="scss">
ion-fab {
  &[hidden] {
    display: block;
  }
  ion-fab-list {
    margin-top: 2rem;
    ion-item {
      &.selected {
        ::part(native) {
          border: 1px solid darkgray;
        }
      }
    }
  }

  ion-fab-button {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.75rem;

    :deep(ion-icon) {
      font-size: 18px;
    }
  }

  > ion-fab-button {
    margin-right: 1rem;
    width: 1.8rem;
    height: 1.8rem;
  }
}
</style>
