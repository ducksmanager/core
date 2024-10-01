<template>
  <ion-progress-bar v-if="collectionLoadProgress" :value="collectionLoadProgress"></ion-progress-bar>

  <ion-split-pane
    :style="{ 'margin-top': `${offlineBannerHeight}px` }"
    :class="{ 'greyed-out': isCollectionReadonly }"
    content-id="main-content"
    v-if="isCollectionLoaded"
  >
    <NavigationDrawer />
    <ion-router-outlet id="main-content" />
  </ion-split-pane>
</template>
<script setup lang="ts">
import { socketInjectionKey as dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { offlineBannerHeight, socket, isPersistedDataLoaded, token } = storeToRefs(app());

// @ts-expect-error Unsure why the types are not compatible
getCurrentInstance()!.appContext.app.provide(dmSocketInjectionKey, socket.value!);

const collectionStore = wtdcollection();
const { fetchCollection } = collectionStore;

const isCollectionLoaded = ref(false);

const dataLoader = computed(() => socket.value!.socket.cacheHydrator);

const collectionLoadProgress = computed(() => {
  if (dataLoader.value.state?.mode === 'HYDRATE') {
    return dataLoader.value.state.hydratedCallsDoneAmount / dataLoader.value.state.cachedCallsDone.length;
  } else {
    return undefined;
  }
});

const isCollectionReadonly = computed(() => {
  return (
    dataLoader.value.state?.mode === 'LOAD_CACHE' ||
    (dataLoader.value.state?.mode === 'HYDRATE' &&
      collectionLoadProgress.value !== undefined &&
      collectionLoadProgress.value < 1)
  );
});

watch(
  [isPersistedDataLoaded, token],
  async ([isLoaded, tokenString]) => {
    if (isLoaded && tokenString) {
      dataLoader.value.run(
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