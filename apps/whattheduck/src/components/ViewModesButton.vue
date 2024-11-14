<template>
  <fab-header-button
    v-model:fab="fab"
    v-model:value="currentIssueViewMode"
    :disabled="isOffline"
    :icon="{ ios: eyeOutline, md: eyeSharp }"
    :options="[...issueViewModes]"
  />
</template>
<script setup lang="ts">
import { eyeOutline, eyeSharp } from 'ionicons/icons';

import { app } from '~/stores/app';

const { issueViewModes } = app();
const { isOffline, currentIssueViewMode } = storeToRefs(app());

const fab = shallowRef<ComponentPublicInstance<HTMLIonFabElement> | null>(null);
</script>
