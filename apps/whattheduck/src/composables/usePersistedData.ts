import type { Storage } from '@ionic/storage';

export default async (entries: Record<string, Ref<unknown>>): Promise<void> => {
  const persistedStorage = injectLocal<Storage>('storage')!;
  console.log('keys in cache: ', JSON.stringify(Object.entries(persistedStorage.keys())));
  for (const [persistedRefKey, persistedRef] of Object.entries(entries)) {
    const persistedValue = await persistedStorage.get(persistedRefKey);
    if (persistedValue !== null) {
      try {
        persistedRef.value = JSON.parse(persistedValue);
      } catch (e) {
        console.error(e);
      }
    }
  }

  watch(
    Object.values(entries),
    async () => {
      for (const [persistedRefKey, persistedRef] of Object.entries(entries)) {
        await persistedStorage.set(persistedRefKey, JSON.stringify(persistedRef.value));
        if (persistedRefKey === 'token') {
          console.log(persistedStorage.driver);
          console.log('token: ', JSON.stringify({ token: persistedRef.value }));
        }
      }
    },
    { deep: true },
  );
};
