<template>
  <router-view />
</template>

<script setup lang="ts">
import { buildWebStorage } from "axios-cache-interceptor";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";

import { createCachedCoaApi } from "./api";

collection().loadUser();

onBeforeMount(() => {
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
