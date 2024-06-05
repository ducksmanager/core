<template>
  <ion-app v-if="isReady">
    <OfflineBanner
      :on-offline="routeMeta.onOffline"
      v-if="isOfflineMode"
      @destroy="innerTopMargin = 0"
      @updated="innerTopMargin = $event"
    />
    <ion-split-pane :style="{ 'margin-top': `${innerTopMargin}px` }" content-id="main-content">
      <NavigationDrawer v-if="token" />
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import type { Storage } from '@ionic/storage';
import Cookies from 'js-cookie';
import { buildStorage } from '~socket.io-client-services';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';

import type { RouteMeta } from '~/router';

const storage = injectLocal<Storage>('storage')!;

const session = {
    getToken: async () => token.value,
    clearSession: () => {
      token.value = null;
      Cookies.remove('token');
      storage.clear();
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

const dmSocket = useDmSocket(injectLocal('dmSocket')!, {
  cacheStorage,
  session,
  onConnectError,
});

provideLocal(dmSocketInjectionKey, dmSocket);

const appStore = app();
const { isOfflineMode, token, socketCache } = storeToRefs(appStore);

const innerTopMargin = ref(0);

const collectionStore = wtdcollection();
const { fetchAndTrackCollection } = collectionStore;
const route = useRoute();
const router = useRouter();

const isReady = computed(() => appStore.isPersistedDataLoaded && collectionStore.isPersistedDataLoaded);

const routeMeta = computed(() => route.meta as RouteMeta);

watch(
  [isReady, token],
  async () => {
    if (isReady.value) {
      switch (token.value) {
        case undefined:
          console.error('Token is undefined but data is loaded');
          break;
        case null:
          if (route.path !== '/login') {
            router.push('/login');
          }
          break;
        default:
          await fetchAndTrackCollection();
      }
    }
  },
  { immediate: true },
);
</script>
