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
      {{ $t("Vous devez être connecté pour accéder à cette page.") }}
      <a :href="loginUrl">{{ $t("Se connecter") }}</a>
    </h4>
  </b-container>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import {
  buildWebStorage,
  cacheStorage,
  session,
} from "~socket.io-client-services";
import { stores as webStores } from "~web";

const { t: $t } = useI18n();

const loginUrl = computed(
  () => `${import.meta.env.VITE_DM_URL}/login?redirect=${document.URL}`
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
<style>
@import "vue-draggable-resizable/style.css";
</style>
