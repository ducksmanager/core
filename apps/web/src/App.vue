<template>
  <router-view />
</template>

<script setup lang="ts">
import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import {
  cacheStorage,
  clearSessionFn,
  getTokenFn,
} from "~/composables/useSocket";

const collectionStore = collection();

onBeforeMount(() => {
  getTokenFn.value = () => Promise.resolve(Cookies.get("token"));
  clearSessionFn.value = () => Promise.resolve(Cookies.remove("token"));
  cacheStorage.value = buildWebStorage(sessionStorage);

  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
