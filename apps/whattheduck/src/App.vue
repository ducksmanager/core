<template>
  <ion-app>
    <OfflineBanner :on-offline="routeMeta.onOffline" v-if="isOfflineMode" />

    <ion-router-outlet
      v-if="route.path === '/login' || route.path === '/test'"
      :style="{ 'margin-top': `${offlineBannerHeight}px` }"
      id="main-content"
    />
    <AppWithPersistedData v-else-if="socket" />
  </ion-app>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import type { Storage } from '@ionic/storage';
import Cookies from 'js-cookie';
import { buildStorage, SocketClient } from '~socket.io-client-services';

import OfflineBanner from './components/OfflineBanner.vue';
import { app } from './stores/app';
import AppWithPersistedData from './views/AppWithPersistedData.vue';

import CoaServices from '~dm-services/coa/types';
import CollectionServices from '~dm-services/collection/types';

const storage = injectLocal<Storage>('storage')!;

const appStore = app();
const { isOfflineMode, token, socket, offlineBannerHeight } = storeToRefs(appStore);

const route = useRoute();
const router = useRouter();

interface RouteMeta {
  onOffline?: 'readonly' | 'unavailable';
  onNoToken?: 'logout';
}

const routeMeta = computed(() => route.meta as RouteMeta);

const assignSocket = () => {
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
      set: (key, data, currentRequest) => {
        const item = {
          value: data,
          ttl: currentRequest?.timeout || 0,
          timestamp: Date.now(),
        };
        storage.set(key, JSON.stringify(item));
      },
      find: async (key) => {
        const item = await storage.get(key);
        if (!item) {
          return undefined;
        }

        const { value, ttl, timestamp } = JSON.parse(item);
        const now = Date.now();

        if (now - timestamp > ttl) {
          storage.remove(key);
          return undefined;
        }

        return value;
      },
      remove: (key) => storage.remove(key),
      clear: () => storage.clear(),
    }),
    onConnected = (namespace: string) => {
      if (namespace === CoaServices.namespaceEndpoint) {
        isOfflineMode.value = false;
      }
    },
    onConnectError = (e: Error, namespace: string) => {
      if (e.name === 'offline_no_cache') {
        isOfflineMode.value = 'offline_no_cache';
      } else if (namespace === CollectionServices.namespaceEndpoint) {
        if ([/jwt expired/, /invalid signature/].some((regex) => regex.test(e.message))) {
          session.clearSession();
        }
      } else if (namespace === CoaServices.namespaceEndpoint && isOfflineMode.value === false) {
        isOfflineMode.value = true;
      }
    };
  const socketUrl = ['web', 'ios'].includes(Capacitor.getPlatform())
    ? import.meta.env.VITE_DM_SOCKET_URL
    : import.meta.env.VITE_DM_SOCKET_URL_NATIVE;
  console.log(`Using socket URL ${socketUrl}`);
  socket.value = useDmSocket(new SocketClient(socketUrl), {
    cacheStorage,
    session,
    onConnected,
    onConnectError,
  });
  socket.value.coa.connect();
};

watch(token, async () => {
  if (token.value === null && route.path !== '/login') {
    await router.push('/login');
  } else {
    assignSocket();
  }
});
</script>
