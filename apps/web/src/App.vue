<template>
  <router-view />
</template>

<script setup lang="ts">
import axios from "axios";
import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { stats } from "~/stores/stats";
import { addTokenRequestInterceptor } from "~axios-helper";

import { createCachedCoaApi } from "./api";
import { users } from "./stores/users";

onBeforeMount(() => {
  const defaultApi = addTokenRequestInterceptor(
    axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
    }),
    () => Promise.resolve(Cookies.get("token") || ""),
  );

  users().setApi({
    api: defaultApi,
  });
  stats().setApi({
    api: defaultApi,
  });
  collection().setApi({
    api: defaultApi,
    clearSessionFn: () => Promise.resolve(Cookies.remove("token")),
    sessionExistsFn: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  });
  coa().setApi({
    api: createCachedCoaApi(
      buildWebStorage(sessionStorage),
      import.meta.env.VITE_GATEWAY_URL,
    ),
  });
  collection().loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
