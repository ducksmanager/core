<template>
  <ion-app>
    <ion-split-pane content-id="main-content" v-if="isReady">
      <NavigationDrawer v-if="isConnected" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';
import { buildStorage, session, cacheStorage } from '~socket.io-client-services';

const { isCoaView, isOfflineMode, token, socketCache, isDataLoaded } = storeToRefs(app());
const collectionStore = wtdcollection();
const { loadUser } = collectionStore;
const { user } = storeToRefs(collectionStore);
const route = useRoute();

const isReady = computed(() => isDataLoaded.value && collectionStore.isDataLoaded);

watch(isReady, (newValue) => {
  if (newValue) {
    isDataLoaded.value = true;
    session.value = {
      getToken: async () => token.value,

      clearSession: () => {
        token.value = undefined;
      },
      onConnectError: () => {
        isOfflineMode.value = true;
      },
      sessionExists: async () => token.value !== undefined,
    };
    cacheStorage.value = buildStorage({
      set: (key, data) => {
        socketCache.value[key] = data;
      },
      find: (key) => socketCache.value[key],
      remove: (key) => {
        delete socketCache.value[key];
      },
    });

    watch(
      () => token.value,
      async (newValue) => {
        if (newValue) {
          await loadUser();
        }
      },
      { immediate: true },
    );
  }
});

const isConnected = computed(() => !!user.value);

watch(
  () => route.query?.coa,
  (newValue) => {
    isCoaView.value = newValue === 'true';
  },
  { immediate: true },
);
</script>
