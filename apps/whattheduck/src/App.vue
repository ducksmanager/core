<template>
  <ion-app>
    <OfflineBanner
      :on-offline="routeMeta.onOffline"
      v-if="isOfflineMode"
      @destroy="innerTopMargin = 0"
      @updated="innerTopMargin = $event"
    />
    <AppWithPersistedData v-if="socket" />

    <ion-split-pane
      v-else-if="route.path === 'login'"
      :style="{ 'margin-top': `${innerTopMargin}px` }"
      content-id="main-content"
    >
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import type { Storage } from '@ionic/storage';
import Cookies from 'js-cookie';
import { buildStorage, useSocket } from '~socket.io-client-services';

import { app } from './stores/app';
import AppWithPersistedData from './views/AppWithPersistedData.vue';

import type { RouteMeta } from '~/router';

const storage = injectLocal<Storage>('storage')!;

const appStore = app();
const { isOfflineMode, token, socket, socketCache, innerTopMargin } = storeToRefs(appStore);

const route = useRoute();
const router = useRouter();

const routeMeta = computed(() => route.meta as RouteMeta);

watch(token, async () => {
  if (token.value === null && route.path !== '/login') {
    router.push('/login');
  } else if (token.value) {
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
    socket.value = useDmSocket(
      useSocket(
        Capacitor.getPlatform() === 'web'
          ? import.meta.env.VITE_DM_SOCKET_URL
          : import.meta.env.VITE_DM_SOCKET_URL_NATIVE,
      ),
      {
        cacheStorage,
        session,
        onConnectError,
      },
    );
  }
});
</script>
