<template>
  <ion-app>
    <ion-progress-bar v-if="bundleDownloadProgress" :value="bundleDownloadProgress"></ion-progress-bar>
    <OfflineBanner v-if="isOfflineMode" :on-offline="routeMeta.onOffline" />

    <ion-router-outlet
      v-if="['/login', '/signup', '/test', '/forgot'].includes(route.path)"
      id="main-content"
      :style="{ 'margin-top': `${offlineBannerHeight}px` }"
      :class="{ 'greyed-out': bundleDownloadProgress !== undefined }"
    />
    <AppWithPersistedData v-else-if="socket" />
  </ion-app>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import type { Storage as IonicStorage } from '@ionic/storage';
import { buildStorage } from '~socket.io-client-services';

import OfflineBanner from './components/OfflineBanner.vue';
import { app } from './stores/app';
import { collection } from '~web/src/stores/collection';
import AppWithPersistedData from './views/AppWithPersistedData.vue';

import CollectionServices from '~dm-services/collection/types';

const storage = injectLocal<IonicStorage>('storage')!;

const appStore = app();
const { isOfflineMode, token, socket, offlineBannerHeight } = storeToRefs(appStore);
console.log('token after storeToRefs', token.value);

const route = useRoute();
const router = useRouter();

const bundleDownloadProgress = ref<number | undefined>(undefined);

interface RouteMeta {
  onOffline?: 'readonly' | 'unavailable';
  onNoToken?: 'logout';
}

const routeMeta = computed(() => route.meta as RouteMeta);

const cacheStorage = buildStorage({
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

    return JSON.parse(item).value;
  },
  remove: (key) => storage.remove(key),
  clear: () => storage.clear(),
});

const assignSocket = () => {
  const session = {
    getToken: async () => token.value,
    clearSession: () => {
      token.value = null;
      storage.clear();
      router.push('/logout');
    },
    sessionExists: async () => token.value !== undefined,
  };

  socket.value = useDmSocket({
    cacheStorage,
    onConnected: () => {
      isOfflineMode.value = false;
    },
    onConnectError: (e, namespace) => {
      if (
        namespace === CollectionServices.namespaceEndpoint &&
        [/jwt expired/, /invalid signature/].some((regex) => regex.test(e.message))
      ) {
        session.clearSession();
      } else if (!collection().issues) {
        isOfflineMode.value = 'offline_no_cache';
      } else {
        isOfflineMode.value = true;
      }
    },
    session,
  });
};

const updateBundle = async () => {
  const currentBundleVersion = (await CapacitorUpdater.current())?.bundle.version;
  try {
    const bundle = await socket.value!.app.services.getBundleUrl({ version: currentBundleVersion });
    console.log('Latest bundle', bundle);
    if (Capacitor.isNativePlatform() && 'url' in bundle && bundle.url) {
      CapacitorUpdater.addListener('download', ({ percent }) => {
        bundleDownloadProgress.value = percent / 100;
      });
      CapacitorUpdater.addListener('downloadFailed', () => {
        bundleDownloadProgress.value = undefined;
      });
      CapacitorUpdater.addListener('updateFailed', () => {
        bundleDownloadProgress.value = undefined;
      });
      const bundleInfo = await CapacitorUpdater.download(bundle);
      await CapacitorUpdater.set(bundleInfo);
    }
  } catch (e) {
    const { error, errorDetails } = e as unknown as { error: string; errorDetails: string };
    switch (error) {
      case 'Already up to date':
        console.log('Bundle is already up to date');
        break;
      default:
        console.warn(error, errorDetails);
    }
  }
};

assignSocket();
updateBundle().finally(() => {
  watch(
    token,
    async () => {
      if (token.value === null && route.path !== '/login') {
        await router.push('/login');
      }
    },
    { immediate: true },
  );
});
</script>
