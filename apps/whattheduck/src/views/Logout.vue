<template></template>

<script setup lang="ts">
import { app } from '~/stores/app';

const router = useRouter();

(async () => {
  app().token = undefined;
  await router.push('/');
})();
</script>
