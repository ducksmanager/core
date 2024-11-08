<template>
  <b-container fluid class="p-2 border-bottom">
    <h2>DuMILi</h2>
    <h3>{{ $t("DucksManager Inducks Little helper") }}</h3>
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

import useDmSocket, {
  socketInjectionKey as dmSocketInjectionKey,
} from "~web/src/composables/useDmSocket";

import useDumiliSocket, {
  dumiliSocketInjectionKey,
} from "./composables/useDumiliSocket";

import { buildWebStorage } from "~socket.io-client-services/index";

const { t: $t } = useI18n();

const session = {
  getToken: () => Promise.resolve(Cookies.get("token")),
  clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
  sessionExists: () =>
    Promise.resolve(typeof Cookies.get("token") === "string"),
};

const onConnectError = (e: Error) => {
  const error = String(e);
  console.error(error);
  if (
    error.indexOf("No token provided") !== -1 ||
    error.indexOf("jwt expired") !== -1
  ) {
    session.clearSession();
    isLoadingUser.value = false;
    user.value = null;
  }
};

getCurrentInstance()!.appContext.app.provide(
  dumiliSocketInjectionKey,
  useDumiliSocket({
    session,
    onConnectError,
  }),
);

getCurrentInstance()!.appContext.app.provide(
  dmSocketInjectionKey,
  useDmSocket({
    cacheStorage: buildWebStorage(sessionStorage),
    session,
    onConnectError,
  }),
);

const loginUrl = computed(
  () => `${import.meta.env.VITE_DM_URL}/login?redirect=${document.URL}`,
);

const { loadUser } = collection();
// const { fetchCountryNames } = coa();
const { user, isLoadingUser } = storeToRefs(collection());

onBeforeMount(() => {
  loadUser();
});

// watch(user, (newValue) => {
//   if (newValue) {
//     getCurrentInstance()!.appContext.app.inject(dumiliSocketInjectionKey).
//   }
// });
</script>
<style lang="scss">
@import "./style.scss";
@import "vue-draggable-resizable/style.css";
</style>
