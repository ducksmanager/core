<template>
  <b-container
    fluid
    class="position-relative d-flex flex-column align-items-center justify-content-center p-2"
  >
    <div class="d-flex flex-row align-items-center">
      <router-link class="display-6" to="/">DuMILi</router-link>
      <div v-if="!isSocketConnected" class="ms-2 text-danger">
        {{ $t("(hors-ligne)") }}
      </div>
    </div>
    {{ $t("DUcksManager Inducks LIttle helper") }}
    <b-dropdown
      v-if="dumiliUser"
      id="user-dropdown"
      :auto-close="false"
      variant="light"
      class="position-absolute start-0 d-flex"
    >
      <template #button-content><i-bi-person-fill /></template>
      <b-form @submit.prevent="updateUser">
        <b-dropdown-item
          >{{ $t("Nom d'utilisateur Inducks") }}
          <input
            v-model="dumiliUser.inducksUsername"
            type="text"
            @click.stop="() => {}"
        /></b-dropdown-item>
        <b-dropdown-item>
          <b-button type="submit" variant="primary">{{ $t("OK") }}</b-button>
        </b-dropdown-item>
      </b-form>
    </b-dropdown>
  </b-container>

  <b-container
    fluid
    class="d-flex flex-column flex-grow-1 overflow-y-auto justify-content-center"
  >
    <router-view v-if="user" />

    <h4 v-else-if="!isSocketConnected">
      {{ $t("Dumili n'est pas actif actuellement :-(") }}
    </h4>

    <h4 v-else>
      {{ $t("Vous devez être connecté pour accéder à cette page.") }}
      <a :href="loginUrl">{{ $t("Connexion") }}</a>
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

import { buildWebStorage } from "socket-call-client";
import type { user } from "~prisma/client_dumili";

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
    user.value = undefined;
  }
};

const dumiliSocket = useDumiliSocket({
  session,
  onConnectError,
});

const isSocketConnected = computed(
  () => !!dumiliSocket.indexationsSocket.value,
);

getCurrentInstance()!.appContext.app.provide(
  dumiliSocketInjectionKey,
  dumiliSocket,
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

const { isLoadingUser, user } = storeToRefs(collection());
const { loadUser } = collection();
const dumiliUser = ref<user>();

const updateUser = async () => {
  const { indexationsSocket } = dumiliSocket;
  await indexationsSocket.value!.updateUser(dumiliUser.value!);
};

watch(
  user,
  async (newUser, oldUser) => {
    if (newUser && !oldUser) {
      const { indexationsSocket } = dumiliSocket;
      dumiliUser.value = await indexationsSocket.value!.getUser();
    }
  },
  { immediate: true },
);

watch(
  isSocketConnected,
  (value) => {
    if (value) {
      loadUser();
    }
  },
  { immediate: true },
);
</script>
<style lang="scss">
@import "./style.scss";
@import "vue-draggable-resizable/style.css";

.dropdown {
  margin-left: calc(var(--bs-gutter-x) * 0.5);
}
</style>
