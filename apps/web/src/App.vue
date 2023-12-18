<template>
  <router-view />
</template>

<script setup lang="ts">
import axios from "axios";
// import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import { addTokenRequestInterceptor } from "~axios-helper";

// import { createCachedCoaApi } from "./api";
import { io } from "socket.io-client";

const usersStore = users();
const statsStore = stats();
const publicCollectionStore = publicCollection();
const collectionStore = collection();
const coaStore = coa();

onBeforeMount(() => {
  const defaultApi = addTokenRequestInterceptor(
    axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
    }),
    () => Promise.resolve(Cookies.get("token") || ""),
  );

  usersStore.setApi({
    api: defaultApi,
  });
  statsStore.setApi({
    api: defaultApi,
  });
  statsStore.setSocket({
    socket: io(import.meta.env.VITE_SOCKET_URL+'/stats'),
  });
  publicCollectionStore.setApi({
    api: defaultApi,
  });
  collectionStore.setApi({
    api: defaultApi,
    clearSessionFn: () => Promise.resolve(Cookies.remove("token")),
    sessionExistsFn: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  });
  collectionStore.setSocket({
    socket: io(import.meta.env.VITE_SOCKET_URL),
  });
  coaStore.setSocket({
    socket: io(import.meta.env.VITE_SOCKET_URL+'/coa'),
  });
  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
