<template>
  <router-view />
</template>

<script setup lang="ts">
import axios from "axios";
import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { addTokenRequestInterceptor } from "~axios-helper";

import { createCachedCoaApi } from "./api";

onBeforeMount(() => {
  collection().setApi(
    addTokenRequestInterceptor(
      axios.create({
        baseURL: import.meta.env.VITE_GATEWAY_URL,
      }),
      () => Promise.resolve(Cookies.get("token") || ""),
    ),
  );
  coa().setApi(
    createCachedCoaApi(
      buildWebStorage(sessionStorage),
      import.meta.env.VITE_GATEWAY_URL,
    ),
  );
  collection().loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
