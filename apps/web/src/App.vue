<template>
  <router-view />
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";
import { cachedCoaApi } from "~/util/api";

import { coa } from "./stores/coa";

collection().loadUser();

onBeforeMount(() => {
  coa().setApi(cachedCoaApi);
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
