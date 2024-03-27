<template>
  <ion-app v-if="isReady">
    <OfflineBanner v-if="isOfflineMode && routeMeta.onOffline !== 'readonly'" />
    <ion-split-pane
      :class="{ 'ion-margin-top': isOfflineMode && routeMeta.onOffline !== 'readonly' }"
      v-if="!(isOfflineMode && routeMeta.onOffline === 'unavailable')"
      content-id="main-content"
    >
      <NavigationDrawer />
      <template v-if="isOfflineMode && routeMeta.onOffline === 'readonly'">
        <ion-item>
          <ion-label>{{
            t(
              'Vous êtes en mode hors-ligne. Vous pouvez naviguer dans votre collection mais pas la modifier. Certaines fonctionnalités ne sont pas disponibles.',
            )
          }}</ion-label>
        </ion-item>
      </template>
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { buildStorage } from '~socket.io-client-services';

import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';
import { stores as dmStores } from '~web';

import type { RouteMeta } from '~/router';

const { isOfflineMode, token, isDataLoaded, socketCache } = storeToRefs(app());

dmStores.socket().init({
  cacheStorage: buildStorage({
    set: (key, data) => {
      socketCache.value[key] = data;
    },
    find: (key) => socketCache.value[key],
    remove: (key) => {
      delete socketCache.value[key];
    },
  }),
  session: {
    getToken: async () => token.value,
    clearSession: () => {
      token.value = undefined;
    },
    onConnectError: (_: any, namespace: string) => {},
    sessionExists: async () => token.value !== undefined,
  },
});

const collectionStore = wtdcollection();
const { loadUser } = collectionStore;
const route = useRoute();

const { t } = useI18n();

const isReady = computed(() => isDataLoaded.value && collectionStore.isDataLoaded);

const routeMeta = computed(() => route.meta as RouteMeta);

watch(isReady, (newValue) => {
  if (newValue) {
    isDataLoaded.value = true;

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
</script>
