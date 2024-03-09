<template>
  <ion-app v-if="isReady">
    <ion-item v-if="isOfflineMode && (routeMeta.onOffline === 'unavailable' || !user)">
      <ion-label>{{
        t(
          'La connexion à votre compte DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
        )
      }}</ion-label>
    </ion-item>
    <ion-split-pane v-else content-id="main-content">
      <NavigationDrawer v-if="isConnected" />
      <ion-page>
        <template v-if="isOfflineMode">
          <ion-item v-if="routeMeta.onOffline === 'readonly'">
            <ion-label>{{
              t(
                'Vous êtes en mode hors-ligne. Vous pouvez naviguer dans votre collection mais pas la modifier. Certaines fonctionnalités ne sont pas disponibles.',
              )
            }}</ion-label>
          </ion-item>
        </template>
        <ion-router-outlet id="main-content" /></ion-page
    ></ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { RouteMeta } from '~/router';
import { app } from './stores/app';
import { wtdcollection } from './stores/wtdcollection';
import { buildStorage, session, cacheStorage } from '~socket.io-client-services';

const { isCoaView, isOfflineMode, token, socketCache, isDataLoaded } = storeToRefs(app());
const collectionStore = wtdcollection();
const { loadUser } = collectionStore;
const { user } = storeToRefs(collectionStore);
const route = useRoute();

const { t } = useI18n();

const isReady = computed(() => isDataLoaded.value && collectionStore.isDataLoaded);

const routeMeta = computed(() => route.meta as RouteMeta);

watch(isReady, (newValue) => {
  if (newValue) {
    isDataLoaded.value = true;
    session.value = {
      getToken: async () => token.value,

      clearSession: () => {
        token.value = undefined;
      },
      onConnectError: () => {
        isOfflineMode.value = true;
      },
      sessionExists: async () => token.value !== undefined,
    };
    cacheStorage.value = buildStorage({
      set: (key, data) => {
        socketCache.value[key] = data;
      },
      find: (key) => socketCache.value[key],
      remove: (key) => {
        delete socketCache.value[key];
      },
    });

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

const isConnected = computed(() => typeof user.value === 'object');

watch(
  () => route.query?.coa,
  (newValue) => {
    isCoaView.value = newValue === 'true';
  },
  { immediate: true },
);
</script>
