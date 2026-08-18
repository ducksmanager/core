<template>
  <ion-progress-bar v-if="collectionLoadProgress" :value="collectionLoadProgress"></ion-progress-bar>

  <ion-split-pane
    v-if="isCollectionLoaded"
    :style="{ 'margin-top': `${offlineBannerHeight}px` }"
    :class="{ 'greyed-out': isCollectionReadonly }"
    content-id="main-content"
  >
    <NavigationDrawer />
    <ion-router-outlet id="main-content" />
  </ion-split-pane>
</template>
<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { offlineBannerHeight, socket, isPersistedDataLoaded, token, isOfflineMode } = storeToRefs(app());

getCurrentInstance()!.appContext.app.provide(dmSocketInjectionKey, socket.value!);

const collectionStore = wtdcollection();
const { fetchCollection } = collectionStore;
const { issues } = storeToRefs(collectionStore);

// The connection may fail before the cached collection is read, in which case the
// app is offline but browsable.
watch(issues, (loadedIssues) => {
  if (loadedIssues && isOfflineMode.value === 'offline_no_cache') {
    isOfflineMode.value = true;
  }
});

const isCollectionLoaded = ref(false);

const dataLoader = computed(() => socket.value!.socket.cacheHydrator);

const collectionLoadProgress = computed(() => {
  if (dataLoader.value.state?.value?.mode === 'HYDRATE') {
    return dataLoader.value.state.value.hydratedCallsDoneAmount / dataLoader.value.state.value.cachedCallsDone.length;
  } else {
    return undefined;
  }
});

const isCollectionReadonly = computed(
  () =>
    dataLoader.value.state?.value?.mode === 'LOAD_CACHE' ||
    (dataLoader.value.state?.value?.mode === 'HYDRATE' &&
      collectionLoadProgress.value !== undefined &&
      collectionLoadProgress.value < 1),
);

watch(
  [isPersistedDataLoaded, token],
  async ([isLoaded, tokenString]) => {
    if (isLoaded && tokenString) {
      // Show the cached collection first, then refresh it from the server in the
      // background, so that a slow or absent connection doesn't block rendering.
      await dataLoader.value.run(
        () => fetchCollection(),
        () => {
          isCollectionLoaded.value = true;
          fetchCollection(true);
        },
      );
    }
  },
  { immediate: true },
);
</script>