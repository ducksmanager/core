<template>
  <ion-app>
    <ion-progress-bar v-if="bundleDownloadProgress" :value="bundleDownloadProgress"></ion-progress-bar>
    <OfflineBanner :on-offline="routeMeta.onOffline" v-if="isOfflineMode" />

    <ion-router-outlet
      v-if="['/login', '/signup', '/test'].includes(route.path)"
      :style="{ 'margin-top': `${offlineBannerHeight}px` }"
      id="main-content"
      :class="{ 'greyed-out': bundleDownloadProgress !== undefined }"
    />
    <AppWithPersistedData v-else-if="socket" />
  </ion-app>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import type { Storage as IonicStorage } from '@ionic/storage';
import Cookies from 'js-cookie';
import { buildStorage, SocketClient } from '~socket.io-client-services';

import OfflineBanner from './components/OfflineBanner.vue';
import { app } from './stores/app';
import AppWithPersistedData from './views/AppWithPersistedData.vue';

import AppServices from '~dm-services/app/types';
import CollectionServices from '~dm-services/collection/types';

const storage = injectLocal<IonicStorage>('storage')!;

const appStore = app();
const { isOfflineMode, token, socket, offlineBannerHeight } = storeToRefs(appStore);

const route = useRoute();
const router = useRouter();

const bundleDownloadProgress = ref<number | undefined>(undefined);

interface RouteMeta {
  onOffline?: 'readonly' | 'unavailable';
  onNoToken?: 'logout';
}

const routeMeta = computed(() => route.meta as RouteMeta);

const assignSocket = () => {
  const socketUrl = ['web', 'ios'].includes(Capacitor.getPlatform())
    ? import.meta.env.VITE_DM_SOCKET_URL
    : import.meta.env.VITE_DM_SOCKET_URL_NATIVE || import.meta.env.VITE_DM_SOCKET_URL;
  console.log(`Using socket URL ${socketUrl}`);

  const session = {
    getToken: async () => token.value,
    clearSession: () => {
      token.value = null;
      Cookies.remove('token');
      storage.clear();
    },
    sessionExists: async () => token.value !== undefined,
  };

  socket.value = useDmSocket(new SocketClient(socketUrl), {
    cacheStorage: buildStorage({
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

        return JSON.parse(item);
      },
      remove: (key) => storage.remove(key),
      clear: () => storage.clear(),
    }),
    onConnected: (namespace: string) => {
      if (namespace === AppServices.namespaceEndpoint) {
        isOfflineMode.value = false;
      }
    },
    onConnectError: (e, namespace, event) => {
      if (e.name === 'offline_no_cache' && event !== 'getBundleUrl') {
        isOfflineMode.value = 'offline_no_cache';
      } else if (namespace === CollectionServices.namespaceEndpoint) {
        if ([/jwt expired/, /invalid signature/].some((regex) => regex.test(e.message))) {
          session.clearSession();
        }
      } else if (namespace === AppServices.namespaceEndpoint && isOfflineMode.value === false) {
        isOfflineMode.value = true;
      }
    },
    session,
  });
};

watch(token, async () => {
  if (token.value === null && route.path !== '/login') {
    await router.push('/login');
  } else {
    assignSocket();
    const currentBundleVersion = (await CapacitorUpdater.current())?.bundle.version;
    const bundle = await socket.value!.app.services.getBundleUrl({ version: currentBundleVersion });
    if (Capacitor.isNativePlatform() && 'url' in bundle && bundle.url) {
      CapacitorUpdater.addListener('download', ({ percent }) => {
        bundleDownloadProgress.value = percent / 100;
      });
      const bundleInfo = await CapacitorUpdater.download(bundle);
      await CapacitorUpdater.set(bundleInfo);
    } else {
      switch (bundle.error) {
        case 'Already up to date':
          console.log('Bundle is already up to date');
          break;
        default:
          console.warn(bundle.error);
      }
    }
  }
});
</script>
