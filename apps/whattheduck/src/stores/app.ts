import { defineStore } from 'pinia';
import { NotEmptyStorageValue } from '~socket.io-client-services';
import { Storage } from '@ionic/storage';

const persistentStorage = new Storage();
await persistentStorage.create();

export const app = defineStore('app', () => {
  const lastSync = ref<Date>();
  const token = ref<string>();
  const socketCache = ref<Record<string, NotEmptyStorageValue>>({});

  const addPersistedData = async (entries: Record<string, any>) => {
    for (const [persistedRefKey, persistedRef] of Object.entries(entries)) {
      const persistedValue = await persistentStorage.get(persistedRefKey);
      if (persistedValue !== null) {
        persistedRef.value = JSON.parse(persistedValue);
      }
    }

    watch(
      Object.values(entries),
      async () => {
        for (const [persistedRefKey, persistedRef] of Object.entries(entries)) {
          persistentStorage.set(persistedRefKey, JSON.stringify(persistedRef.value));
        }
      },
      { deep: true },
    );
  };

  addPersistedData({ token, socketCache });

  return {
    addPersistedData,
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
