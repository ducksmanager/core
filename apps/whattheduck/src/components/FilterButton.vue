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