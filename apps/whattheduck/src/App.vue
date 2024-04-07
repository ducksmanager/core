<template>
  <ion-app v-if="isReady">
    <OfflineBanner :on-offline="routeMeta.onOffline" v-if="isOfflineMode" />
    <ion-split-pane :class="{ 'ion-margin-top': isOfflineMode }" content-id="main-content">
      <NavigationDrawer v-if="token" />
      <ion-router-outlet id="main-content" :animate="false" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { buildStorage } from '~socket.io-client-services';
import Cookies from 'js-cookie';

import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';

import type { RouteMeta } from '~/router';
import { Storage } from '@ionic/storage';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

const session = {
    getToken: async () => token.value,
    clearSession: () => {
      token.value = undefined;
      Cookies.remove('token');
      new Storage().clear();
    },
    sessionExists: async () => token.value !== undefined,
  },
  cacheStorage = buildStorage({
    set: (key, data) => {
      socketCache.value[key] = data;
    },
    find: (key) => socketCache.value[key],
    remove: (key) => {
      delete socketCache.value[key];
    },
  }),
  onConnectError = (e: Error) => {
    if (e.message.indexOf('jwt expired') !== -1) {
      session.clearSession();
    }
  };

const dmSocket = useDmSocket({
  cacheStorage,
  session,
  onConnectError,
});

provideLocal(dmSocketInjectionKey, dmSocket);

const { isOfflineMode, token, isDataLoaded, socketCache } = storeToRefs(app());

const collectionStore = wtdcollection();
const { fetchAndTrackCollection } = collectionStore;
const route = useRoute();
const router = useRouter();

const isReady = computed(() => isDataLoaded.value && collectionStore.isDataLoaded);

const routeMeta = computed(() => route.meta as RouteMeta);

watch(isReady, (newValue) => {
  if (newValue) {
    isDataLoaded.value = true;

    watch(
      token,
      async (newValue) => {
        if (newValue) {
          fetchAndTrackCollection().then(() =>
            route.path === '/login' ? router.replace('/collection') : Promise.resolve(),
          );
        }
      },
      { immediate: true },
    );
  }
});
</script>
