<template>
  <router-view />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";
import { stores as webStores } from "~web";

import { buildWebStorage, useSocket } from "~socket.io-client-services";
import { dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

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
  },
  cacheStorage = buildWebStorage(sessionStorage);

const dmSocket = useDmSocket(
  inject("dmSocket") as ReturnType<typeof useSocket>,
  {
    cacheStorage,
    session,
    onConnectError,
  },
);

provideLocal(dmSocketInjectionKey, dmSocket);

onBeforeMount(() => {
  loadUser();
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
