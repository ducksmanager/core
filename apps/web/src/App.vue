<template>
  <router-view v-if="isReady" />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { buildWebStorage } from "~socket.io-client-services";

import { socketInjectionKey } from "./composables/useDmSocket";
let isReady = $ref(false);

const socket = useDmSocket({
  cacheStorage: buildWebStorage(sessionStorage),
  onConnected: () => {
    isReady = true;
    collection().loadUser();
  },
  onConnectError: (e) => {
    console.error(e);
  },
  session: {
    getToken: () => Promise.resolve(Cookies.get("token")),
    clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
    sessionExists: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  },
});

getCurrentInstance()!.appContext.app.provide(socketInjectionKey, socket);

socket.app.connect();
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
