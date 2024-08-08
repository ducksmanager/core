<template>
  <fab-header-button
    :icon="{ ios: funnelOutline, md: funnelSharp }"
    :options="[...filters]"
    v-model:fab="fab"
    v-model:value="currentFilter"
  />
</template>
<script setup lang="ts">
import { funnelOutline, funnelSharp } from 'ionicons/icons';

import { app } from '~/stores/app';

const { filters } = app();
const { currentFilter } = storeToRefs(app());

// eslint-disable-next-line no-undef
const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);
</script>

<style lang="scss" scoped>
ion-fab {
  margin-top: -35px;
  top: initial;
  right: 0.5rem;

  :deep(ion-fab-list) {
    margin-top: 2rem;
  }
}
</style>
