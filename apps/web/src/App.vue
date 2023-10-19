<template>
  <router-view />
</template>

<script setup lang="ts">
import axios from "axios";
import { buildWebStorage } from "axios-cache-interceptor";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";

import { createCachedCoaApi } from "./api";

collection().loadUser();

onBeforeMount(() => {
  collection().setApi(
    axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
    }),
  );
  coa().setApi(
    createCachedCoaApi(
      buildWebStorage(sessionStorage),
      import.meta.env.VITE_GATEWAY_URL,
    ),
  );
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
