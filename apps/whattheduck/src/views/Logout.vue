<template><ion-page></ion-page></template>

<script setup lang="ts">
import type { Storage as IonicStorage } from '@ionic/storage';

import { app } from '~/stores/app';

const router = useRouter();
const storage = injectLocal<IonicStorage>('storage')!;

void (async () => {
  app().token = null;
  await storage.clear();
  await router.replace('/');
})();
</script>
