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
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";

import { collection } from "~/stores/collection";

const route = useRoute();
const router = useRouter();

const firstPathPart = $computed(
  () =>
    (
      router.getRoutes().find(({ path }) => path === route.path)?.aliasOf ||
      route
    ).path.match(/\/([^/]+)/)?.[1],
);

const slots = useSlots();
useHead({
  title: slots.title?.toString() || "DucksManager",
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
