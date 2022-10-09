<template>
  <router-view />
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";

onMounted(async () => {
  await collection().loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
