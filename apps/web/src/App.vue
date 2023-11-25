<template>
  <router-view />
</template>

<script setup lang="ts">
import axios from "axios";
import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import { addTokenRequestInterceptor } from "~axios-helper";

import { createCachedCoaApi } from "./api";
import { publicCollection } from "./stores/public-collection";
import { users } from "./stores/users";

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
  publicCollectionStore.setApi({
    api: defaultApi,
  });
  collectionStore.setApi({
    api: defaultApi,
    clearSessionFn: () => Promise.resolve(Cookies.remove("token")),
    sessionExistsFn: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  });
  coaStore.setApi({
    api: createCachedCoaApi(
      buildWebStorage(sessionStorage),
      import.meta.env.VITE_GATEWAY_URL,
    ),
  });
  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
