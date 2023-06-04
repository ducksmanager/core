<template></template>

<script setup lang="ts">
import { app } from '~/stores/app';
import { User } from '~/persistence/models/dm/User';
import { useRouter } from 'vue-router';

const router = useRouter();
await app().dbInstance.getRepository(User).clear();

await router.replace('/');
</script>
