<template>
  <router-view />
</template>

<script setup lang="ts">
import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import { cacheStorage, session } from "~socket.io-client-services";

const collectionStore = collection();
const { user, isLoadingUser } = storeToRefs(collectionStore);

onBeforeMount(() => {
  session.value = {
    getToken: () => Promise.resolve(Cookies.get("token")),
    clearSession: () => Promise.resolve(Cookies.remove("token")),
    sessionExists: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
    onConnectError: async () => {
      await session.value!.clearSession();
      isLoadingUser.value = false;
      user.value = null;
    },
  };
  cacheStorage.value = buildWebStorage(sessionStorage);

  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
