<template>
  <router-view />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";
import { buildWebStorage } from "socket-call-client";
import { stores as webStores } from "~web";

import useDmSocket, {
  socketInjectionKey as dmSocketInjectionKey,
} from "~web/src/composables/useDmSocket";

const { loadUser } = webStores.collection();
const { user, isLoadingUser } = storeToRefs(webStores.collection());

const session = {
    getToken: () => Promise.resolve(Cookies.get("token")),
    clearSession: () => Promise.resolve(Cookies.remove("token")),
    sessionExists: () =>
      Promise.resolve(typeof Cookies.get("token") === "string"),
  },
  onConnectError = async () => {
    await session.clearSession();
    isLoadingUser.value = false;
    user.value = null;
  };

getCurrentInstance()!.appContext.app.provide(
  dmSocketInjectionKey,
  useDmSocket({
    cacheStorage: buildWebStorage(sessionStorage),
    session,
    onConnectError,
  }),
);

onBeforeMount(() => {
  loadUser();
});
</script>

<style lang="scss">
@use "./styles/main.scss";
</style>
