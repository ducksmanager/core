<template>
  <div>
    <LeftPanel />
    <SwitchLocale />
    <Banner :classes="{ 'd-none d-md-flex': true }" />
    <div id="logo_zone2">
      <BookcaseMenu v-if="firstPathPart === 'bookcase'" />
      <CollectionMenu
        v-if="firstPathPart === 'collection' && !isPublicCollection"
      />
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

const slots = defineSlots<{
  title?: string;
}>();

const { user } = storeToRefs(collection());

const route = useRoute();
const router = useRouter();
const isPublicCollection = $computed(
  () => route.path.indexOf("/collection/user/") > -1,
);

const firstPathPart = $computed(
  () =>
    (
      router.getRoutes().find(({ path }) => path === route.path)?.aliasOf ||
      route
    ).path.match(/\/([^/]+)/)?.[1],
);

useHead({
  title: slots.title?.toString() || "DucksManager",
});

if (!Cookies.get("token")) {
  user.value = null;
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
