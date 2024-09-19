<template>
  <fab-header-button
    :disabled="isOffline"
    :icon="{ ios: eyeOutline, md: eyeSharp }"
    :options="[...issueViewModes]"
    v-model:fab="fab"
    v-model:value="currentIssueViewMode"
  />
</template>
<script setup lang="ts">
import { eyeOutline, eyeSharp } from 'ionicons/icons';

import { app } from '~/stores/app';

const { issueViewModes } = app();
const { isOffline, currentIssueViewMode } = storeToRefs(app());

// eslint-disable-next-line no-undef
const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);
</script>
