<template>
  <router-view />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import {
  buildWebStorage,
  cacheStorage,
  session,
} from "~socket.io-client-services";

const { loadUser } = collection();
const { user, isLoadingUser } = storeToRefs(collection());

onBeforeMount(() => {
  session.value = {
    getToken: () => Promise.resolve(Cookies.get("token")),
    clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
    sessionExists: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
    onConnectError: async () => {
      await session.value!.clearSession();
      isLoadingUser.value = false;
      user.value = null;
    },
  };
  cacheStorage.value = buildWebStorage(sessionStorage);

  loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
