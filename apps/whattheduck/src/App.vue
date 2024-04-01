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
import Cookies from 'js-cookie';

import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';

import type { RouteMeta } from '~/router';
import { Storage } from '@ionic/storage';

const session = {
  getToken: async () => token.value,
  clearSession: () => {
    token.value = undefined;
    Cookies.remove('token');
    new Storage().clear();
  },
  sessionExists: async () => token.value !== undefined,
};

provideLocal(
  'dmSocket',
  useDmSocket({
    cacheStorage: buildStorage({
      set: (key, data) => {
        socketCache.value[key] = data;
      },
      find: (key) => socketCache.value[key],
      remove: (key) => {
        delete socketCache.value[key];
      },
    }),
    onConnectError: (e: Error) => {
      if (e.message.indexOf('jwt expired') !== -1) {
        session.clearSession();
      }
    },
    session,
  }),
);

const { isOfflineMode, token, isDataLoaded, socketCache } = storeToRefs(app());

const collectionStore = wtdcollection();
// const { loadUser } = collectionStore;
const route = useRoute();

const { t } = useI18n();

const isReady = computed(() => isDataLoaded.value && collectionStore.isDataLoaded);

const routeMeta = computed(() => route.meta as RouteMeta);

// watch(isReady, (newValue) => {
//   if (newValue) {
//     isDataLoaded.value = true;

//     watch(
//       () => token.value,
//       async (newValue) => {
//         if (newValue) {
//           await loadUser();
//         }
//       },
//       { immediate: true },
//     );
//   }
// });
</script>
