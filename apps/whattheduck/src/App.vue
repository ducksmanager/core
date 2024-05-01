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
import type { Storage } from '@ionic/storage';

import type { RouteMeta } from '~/router';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

const storage = injectLocal<Promise<Storage>>('storage')!;

const session = {
    getToken: async () => token.value,
    clearSession: () => {
      token.value = null;
      Cookies.remove('token');
      storage.then((storage) => storage.clear());
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
    if (/No token provided/.test(e.message) || /jwt expired/.test(e.message)) {
      session.clearSession();
    }
  };

const dmSocket = useDmSocket({
  cacheStorage,
  session,
  onConnectError,
});

provideLocal(dmSocketInjectionKey, dmSocket);

const appStore = app();
const { isOfflineMode, token, isDataLoaded, socketCache } = storeToRefs(appStore);

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
          fetchAndTrackCollection().then(() => {
            if (route.path === '/login') {
              router.push('/collection');
            }
          });
        }
      },
      { immediate: true },
    );
  }
});
</script>
