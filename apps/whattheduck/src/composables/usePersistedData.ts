import type { Storage } from '@ionic/storage';

export default async (entries: Record<string, Ref<unknown>>): Promise<void> => {
  const storage = injectLocal<Storage>('storage')!;
  console.info('keys in cache: ', JSON.stringify(Object.entries(storage.keys())));
  for (const [storageKey, persistedRef] of Object.entries(entries)) {
    const storageValue = await storage.get(storageKey);
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
      console.info('saving entries', entries);
      for (const [storageKey, persistedRef] of Object.entries(entries)) {
        await storage.set(storageKey, JSON.stringify(persistedRef.value));
      }
    },
    { deep: true },
  );
};
