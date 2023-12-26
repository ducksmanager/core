<template>
  <router-view />
</template>

<script setup lang="ts">
import axios from "axios";
// import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";
// import { createCachedCoaApi } from "./api";
import { io } from "socket.io-client";

import { Namespace as BookcaseNamespace } from "~api/services/bookcase/types";
import { Namespace as CoaNamespace } from "~api/services/coa/types";
import { Namespace as CollectionNamespace } from "~api/services/collection/types";
import { Namespace as EventsNamespace } from "~api/services/events/types";
import { Namespace as LoginNamespace } from "~api/services/login/types";
import { Namespace as PublicCollectionNamespace } from "~api/services/public-collection/types";
import { Namespace as StatsNamespace } from "~api/services/stats/types";
import { addTokenRequestInterceptor } from "~axios-helper";

const usersStore = users();
const statsStore = stats();
const publicCollectionStore = publicCollection();
const collectionStore = collection();
const coaStore = coa();
const bookcaseStore = bookcase();

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
  usersStore.setSocket({
    socket: io(import.meta.env.VITE_SOCKET_URL + EventsNamespace["endpoint"]),
  });
  statsStore.setApi({
    api: defaultApi,
  });
  bookcaseStore.setSocket({
    socket: io(import.meta.env.VITE_SOCKET_URL + BookcaseNamespace["endpoint"]),
  });
  statsStore.setSocket({
    statsSocket: io(
      import.meta.env.VITE_SOCKET_URL + StatsNamespace["endpoint"],
    ),
    collectionSocket: io(
      import.meta.env.VITE_SOCKET_URL + CollectionNamespace["endpoint"],
    ),
  });
  publicCollectionStore.setSocket({
    socket: io(
      import.meta.env.VITE_SOCKET_URL + PublicCollectionNamespace["endpoint"],
    ),
  });
  collectionStore.setApi({
    clearSessionFn: () => Promise.resolve(Cookies.remove("token")),
    sessionExistsFn: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  });
  collectionStore.setSocket({
    statsSocket: io(
      import.meta.env.VITE_SOCKET_URL + StatsNamespace["endpoint"],
    ),
    loginSocket: io(
      import.meta.env.VITE_SOCKET_URL + LoginNamespace["endpoint"],
    ),
    collectionSocket: io(
      import.meta.env.VITE_SOCKET_URL + CollectionNamespace["endpoint"],
    ),
  });
  coaStore.setSocket({
    socket: io(import.meta.env.VITE_SOCKET_URL + CoaNamespace["endpoint"]),
  });
  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
