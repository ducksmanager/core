<template>
  <div>
    <LeftPanel />
    <SwitchLocale />
    <Banner :classes="{ 'd-none d-md-flex': true }" />
    <div id="logo_zone2">
      <BookcaseMenu v-if="firstPathPart === 'bookcase'" />
      <CollectionMenu v-if="firstPathPart === 'collection'" />
      <StatsMenu v-if="firstPathPart === 'stats'" />
      <ExpandMenu v-if="firstPathPart === 'expand'" />
      <div v-html="'<span></span>'"></div>
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";

import { collection } from "~/stores/collection";

const route = useRoute();
console.log(route.path);
const router = useRouter();

const firstPathPart = $computed(
  () =>
    (
      router.getRoutes().find(({ path }) => path === route.path)?.aliasOf ||
      route
    ).path.match(/\/([^/]+)/)?.[1]
);

console.log(useRouter());

const slots = useSlots();
useHead({
  title: slots.title || "DucksManager",
});

if (!Cookies.get("token")) {
  collection().user = null;
}
</script>

<style scoped lang="scss">
* {
  color: white;
  background-color: rgb(61, 75, 95) !important;
}

#logo_zone2 {
  padding: 45px 20px 20px 20px;
  vertical-align: top;
  min-height: calc(100vh - 105px);
}

@media (max-width: 767px) {
  #logo_zone2 {
    background: none;
    min-height: calc(100vh - 125px);
  }
}
</style>
