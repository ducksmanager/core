<template>
  <router-view />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import type { SocketClient } from "~socket.io-client-services";
import { buildWebStorage } from "~socket.io-client-services";

import { dmSocketInjectionKey } from "./composables/useDmSocket";

getCurrentInstance()!.appContext.app.provide(
  dmSocketInjectionKey,
  useDmSocket(inject("dmSocket") as SocketClient, {
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
  }),
);

const { loadUser } = collection();
const { isLoadingUser, user } = storeToRefs(collection());

loadUser();
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
