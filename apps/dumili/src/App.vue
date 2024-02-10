<template>
  <b-container fluid class="p-2 border-bottom">
    <h2>DuMILi</h2>
    <h3>DucksManager Inducks Little helper</h3>
  </b-container>

  <b-container
    fluid
    class="d-flex flex-column flex-grow-1 overflow-y-auto justify-content-center"
  >
    <router-view v-if="user" />

    <h4 v-else>
      Vous devez être connecté pour accéder à cette page.
      <a :href="loginUrl">Se connecter</a>
    </h4>
  </b-container>

  <b-container
    v-if="activeTab !== undefined"
    class="start-0 bottom-0 mw-100 pt-2"
    ><b-tabs v-model:modelValue="activeTab" align="center"
      ><b-tab title="Page gallery" /><b-tab title="Book" /><b-tab
        title="Text editor" /></b-tabs
  ></b-container>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import {
  buildWebStorage,
  cacheStorage,
  session,
} from "~socket.io-client-services";
import { stores as webStores } from "~web";

import { tabs } from "./stores/tabs";

const route = useRoute();

const { activeTab } = storeToRefs(tabs());

const loginUrl = computed(
  () => `${import.meta.env.VITE_DM_URL}/login?redirect=${document.URL}`
);

watch(
  () => route?.params?.id,
  (id) => {
    activeTab.value = id ? 0 : undefined;
  },
  { immediate: true }
);

const { loadUser } = webStores.collection();
const { user, isLoadingUser } = storeToRefs(webStores.collection());

onBeforeMount(() => {
  session.value = {
    getToken: () => Promise.resolve(Cookies.get("token")),
    clearSession: () => {}, //Promise.resolve(Cookies.remove("token")),
    sessionExists: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
    onConnectError: async () => {
      await session.value!.clearSession();
      isLoadingUser.value = false;
      user.value = null;
    },
  };
  cacheStorage.value = buildWebStorage(sessionStorage);

  loadUser();
});
</script>
