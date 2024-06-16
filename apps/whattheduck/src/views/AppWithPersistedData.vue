<template>
  <ion-split-pane :style="{ 'margin-top': `${innerTopMargin}px` }" content-id="main-content">
    <ion-router-outlet id="main-content" />
  </ion-split-pane>
</template>
<script setup lang="ts">
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { innerTopMargin, socket } = storeToRefs(app());

provideLocal(dmSocketInjectionKey, socket.value as ReturnType<typeof useDmSocket>);

const collectionStore = wtdcollection();
const { fetchAndTrackCollection } = collectionStore;
const { isPersistedDataLoaded } = storeToRefs(collectionStore);

watch(isPersistedDataLoaded, async (isLoaded) => {
  if (isLoaded) {
    await fetchAndTrackCollection();
  }
});
</script>
