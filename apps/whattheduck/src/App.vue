<template>
  <ion-app>
    <OfflineBanner :on-offline="routeMeta.onOffline" v-if="isOfflineMode" />

    <ion-router-outlet
      v-if="route.path === '/login'"
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
import { buildStorage, useSocket } from '~socket.io-client-services';

import OfflineBanner from './components/OfflineBanner.vue';
import { app } from './stores/app';
import AppWithPersistedData from './views/AppWithPersistedData.vue';

const storage = injectLocal<Storage>('storage')!;

const appStore = app();
const { isOfflineMode, token, socket, socketCache, offlineBannerHeight } = storeToRefs(appStore);

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
      set: (key, data) => {
        socketCache.value[key] = data;
      },
      find: (key) => socketCache.value[key],
      remove: (key) => {
        delete socketCache.value[key];
      },
    }),
    onConnectError = (e: Error) => {
      if ([/jwt expired/, /invalid signature/].some((regex) => regex.test(e.message))) {
        session.clearSession();
      }
    };
  const socketUrl = ['web', 'ios'].includes(Capacitor.getPlatform())
    ? import.meta.env.VITE_DM_SOCKET_URL
    : import.meta.env.VITE_DM_SOCKET_URL_NATIVE;
  console.log(`Using socket URL ${socketUrl}`);
  socket.value = useDmSocket(useSocket(socketUrl), {
    cacheStorage,
    session,
    onConnectError,
  });
};

watch(token, async () => {
  if (token.value === null && route.path !== '/login') {
    await router.push('/login');
  } else {
    assignSocket();
  }
});
</script>
