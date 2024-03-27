import { defineStore } from 'pinia';
import type { NotEmptyStorageValue } from '~socket.io-client-services';

import usePersistedData from '~/composables/usePersistedData';

export const app = defineStore('app', () => {
  const coaSocket = ref<Awaited<ReturnType<typeof coaServices['socket']>>>();

  nextTick(async () => {
    coaSocket.value = await socket().dmSocket!.coaServices.socket();
  })

  const route = useRoute();
  const lastSync = ref<Date>();
  const token = ref<string>();
  const socketCache = ref<Record<string, NotEmptyStorageValue>>({});
  const isDataLoaded = ref(false);

  usePersistedData({
    token,
    socketCache,
  }).then(() => {
    isDataLoaded.value = true;
  });

  return {
    isDataLoaded,
    socketCache,
    lastSync,
    currentNavigationItem: ref(undefined as string | undefined),
    token,
    isOfflineMode: computed(() => coaSocket.value && !coaSocket.value.connected || false),
    isCoaView: computed(() => route.query.coa === 'true'),
    isObsoleteSync: computed(
      () => !lastSync.value || new Date().getTime() - lastSync.value.getTime() > 12 * 60 * 60 * 1000,
    ),
  };
});
