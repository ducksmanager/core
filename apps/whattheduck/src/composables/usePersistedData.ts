import type { Storage } from '@ionic/storage';

export default async (entries: Record<string, Ref<unknown>>): Promise<void> => {
  const storage = injectLocal<Storage>('storage')!;
  console.info('keys in cache: ', JSON.stringify(Object.entries(storage.keys())));
  for (const [storageKey, persistedRef] of Object.entries(entries)) {
    const storageValue = await storage.get(storageKey);
    console.info('restoring entry', storageKey, 'with value', storageValue);
    console.info({ storageKey, storageValue });
    if (storageValue !== null) {
      try {
        persistedRef.value = JSON.parse(storageValue);
      } catch (e) {
        console.error(e);
      }
    }
  }

  watch(
    Object.values(entries),
    async () => {
      for (const [storageKey, persistedRef] of Object.entries(entries)) {
        const value = JSON.stringify(persistedRef.value);
        console.info('saving entry', storageKey, 'with value', value);
        await storage.set(storageKey, value);
      }
    },
    { deep: true },
  );
};
