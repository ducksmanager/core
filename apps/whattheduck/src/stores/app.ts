import { defineStore } from 'pinia';
import type { NotEmptyStorageValue } from '~socket.io-client-services';

import usePersistedData from '~/composables/usePersistedData';
import { dmSocketInjectionKey } from '~web/src/composables/useDmSocket';

export const app = defineStore('app', () => {
  const {
    coa: { socket: coaSocket },
  } = injectLocal(dmSocketInjectionKey)!;

  const isOfflineMode = ref(false);
  setTimeout(() => {
    setInterval(() => {
      isOfflineMode.value = coaSocket && !coaSocket.connected;
    }, 1000);
  }, 1000);

  const route = useRoute();
  const lastSync = ref<Date>();
  const token = ref<string | null>(); // undefined === we haven't checked whether there is a token ; null === we have checked and there is no token
  const socketCache = ref<Record<string, NotEmptyStorageValue>>({});
  const isDataLoaded = ref(false);
  const viewModes = ['list', 'edges', 'covers-small', 'covers-medium', 'covers-big'] as const;
  const issueViewMode = ref<(typeof viewModes)[number]>('list');

  usePersistedData({
    token,
    socketCache,
  }).then(() => {
    isDataLoaded.value = true;
  });

  return {
    coaSocket,
    isDataLoaded,
    socketCache,
    lastSync,
    currentNavigationItem: computed(() => (route.params.publicationcode || route.params.countrycode) as string),
    token,
    isOfflineMode,
    isCoaView: computed(() => route.query.coa === 'true'),
    isObsoleteSync: computed(
      () => !lastSync.value || new Date().getTime() - lastSync.value.getTime() > 12 * 60 * 60 * 1000,
    ),
    viewModes,
    issueViewMode,
  };
});
