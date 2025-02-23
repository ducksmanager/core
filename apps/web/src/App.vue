<template>
  <router-view v-if="isReady" />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { buildWebStorage } from "socket-call-client";

import { socketInjectionKey } from "./composables/useDmSocket";
let isReady = $ref(false);

const socket = useDmSocket({
  cacheStorage: buildWebStorage(sessionStorage),
  onConnected: (namespace) => {
    isReady = true;
    if (namespace === "/collection") {
      collection().loadUser();
    }
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

provideLocal(socketInjectionKey, socket);

socket.app._connect();
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
