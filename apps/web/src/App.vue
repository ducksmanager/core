<template>
  <router-view />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

const collectionStore = collection();

onBeforeMount(() => {
  collectionStore.setApi({
    clearSessionFn: () => Promise.resolve(Cookies.remove("token")),
    sessionExistsFn: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  });
  collectionStore.loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
