import { defineStore } from 'pinia';
import { NotEmptyStorageValue } from '~socket.io-client-services';
import usePersistedData from '~/composables/usePersistedData';

export const app = defineStore('app', () => {
  const lastSync = ref<Date>();
  const token = ref<string>();
  const socketCache = ref<Record<string, NotEmptyStorageValue>>({});
  const isDataLoaded = ref(false);

  usePersistedData({
    token, socketCache,
  }).then(() => {
    isDataLoaded.value = true;  
  })

  return {
    isDataLoaded,
    socketCache,
    lastSync,
    currentNavigationItem: ref(undefined as string | undefined),
    token,
    isOfflineMode: ref(false),
    isCoaView: ref(false),
    isObsoleteSync: computed(
      () => !lastSync.value || new Date().getTime() - lastSync.value.getTime() > 12 * 60 * 60 * 1000,
    ),
  };
});
