<template>
  <router-view />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { buildWebStorage } from "~socket.io-client-services/index";

import { socket } from "./stores/socket";
(async () => {
  socket().init({
    cacheStorage: buildWebStorage(sessionStorage),
    session: {
      onConnectError: () => {
        isLoadingUser.value = false;
        user.value = null;
      },
      getToken: () => Promise.resolve(Cookies.get("token")),
      clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
      sessionExists: () =>
        Promise.resolve(typeof Cookies.get("token") === "string"),
    },
  });
})();
const { loadUser } = collection();
const { isLoadingUser, user } = storeToRefs(collection());

loadUser();
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>./stores/socket
