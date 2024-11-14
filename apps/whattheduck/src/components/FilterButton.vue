<template>
  <fab-header-button
    v-model:fab="fab"
    v-model:value="currentFilter"
    :icon="{ ios: funnelOutline, md: funnelSharp }"
    :options="[...filters]"
  />
</template>
<script setup lang="ts">
import { funnelOutline, funnelSharp } from 'ionicons/icons';

import { app } from '~/stores/app';

const { filters } = app();
const { currentFilter } = storeToRefs(app());

const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);
</script>

<style lang="scss" scoped>
ion-fab {
  margin-top: -32px;
  top: initial;
  right: 0.5rem;

  :deep(ion-fab-list) {
    margin-top: 2rem;
  }
}
</style>
