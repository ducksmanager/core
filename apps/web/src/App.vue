<template>
  <LayoutWrapper v-if="isReady" />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { buildWebStorage } from "socket-call-client";

import { socketInjectionKey } from "./composables/useDmSocket";
let isReady = $ref(false);

const socket = useDmSocket({
  cacheStorage: buildWebStorage(sessionStorage),
  disableCollectionCache: true,
  onConnected: () => {
    if (!isReady) {
      collection().loadUser();
    }
    isReady = true;
  },
  onConnectError: (e) => {
    console.error(e);
    collection().isLoadingUser = false;
  },
  session: {
    getToken: () => Promise.resolve(Cookies.get("token")),
    clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
    sessionExists: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  },
});

getCurrentInstance()!.appContext.app.provide(socketInjectionKey, socket);

socket.app._connect();
</script>

<style lang="scss">
@use "./styles/main.scss";
</style>
