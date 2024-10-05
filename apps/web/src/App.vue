<template>
  <router-view v-if="isReady" />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import type { SocketClient } from "~socket.io-client-services";
import { buildWebStorage } from "~socket.io-client-services";

import { socketInjectionKey } from "./composables/useDmSocket";
let isReady = $ref(false);

const socket = useDmSocket(inject("dmSocket") as SocketClient, {
  cacheStorage: buildWebStorage(sessionStorage),
  onConnectError: () => {
    isLoadingUser.value = false;
    user.value = null;
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

const { loadUser } = collection();
const { isLoadingUser, user } = storeToRefs(collection());

loadUser().then(() => {
  isReady = true;
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
