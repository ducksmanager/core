<template>
  <b-container fluid class="p-2 border-bottom">
    <h2>DuMILi</h2>
    <h3>DucksManager Inducks Little helper</h3>
  </b-container>

  <b-container
    fluid
    class="d-flex flex-column flex-grow-1 overflow-y-auto justify-content-center"
  >
    <router-view v-if="user().user" />

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
import { storeToRefs } from "pinia";

import { tabs } from "./stores/tabs";
import { user } from "./stores/user";
import { defaultApi } from "./util/api";

const route = useRoute();

const activeTab = storeToRefs(tabs()).activeTab;

const loginUrl = computed(
  () => `${import.meta.env.VITE_DM_URL}/login?redirect=${document.URL}`
);

watch(
  () => route?.params?.id,
  (id) => {
    tabs().activeTab = id ? 0 : undefined;
  },
  { immediate: true }
);

(async () => {
  user().user = {
    username: (await defaultApi.get(`${import.meta.env.VITE_BACKEND_URL}/me`))
      .data.user.username,
  };
})();
</script>
