<template></template>

<script setup lang="ts">
import { User } from '~/persistence/models/dm/User';
import { app } from '~/stores/app';

const router = useRouter();
await app().dbInstance.getRepository(User).clear();

await router.push('/');
</script>
