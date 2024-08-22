<template>
  <ion-split-pane
    :style="{ 'margin-top': `${offlineBannerHeight}px` }"
    content-id="main-content"
    v-if="isCollectionLoaded"
  >
    <NavigationDrawer />
    <ion-router-outlet id="main-content" />
  </ion-split-pane>
</template>
<script setup lang="ts">
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { offlineBannerHeight, socket } = storeToRefs(app());

getCurrentInstance()!.appContext.app.provide(dmSocketInjectionKey, socket.value as ReturnType<typeof useDmSocket>);

const collectionStore = wtdcollection();
const { fetchAndTrackCollection } = collectionStore;
const { isPersistedDataLoaded } = storeToRefs(collectionStore);

const isCollectionLoaded = ref(false);

watch(isPersistedDataLoaded, async (isLoaded) => {
  if (isLoaded) {
    await fetchAndTrackCollection();
    isCollectionLoaded.value = true;
  }
});
</script>
