<template><ion-page></ion-page></template>

<script setup lang="ts">
import { app } from '~/stores/app';

const router = useRouter();

(async () => {
  app().token = null;
  await router.push('/');
})();
</script>
