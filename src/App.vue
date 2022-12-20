<template>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import { collection } from "~/stores/collection";

const router = useRouter();

onMounted(async () => {
  await collection().loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
