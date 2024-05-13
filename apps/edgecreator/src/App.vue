<template>
  <router-view v-if="user" />
</template>

<script setup lang="ts">
import { provideLocal } from "@vueuse/core";
import Cookies from "js-cookie";

import { buildWebStorage } from "~socket.io-client-services/index";
import { stores as webStores } from "~web";
import useDmSocket, {
  dmSocketInjectionKey,
} from "~web/src/composables/useDmSocket";

import useEdgecreatorSocket, {
  edgecreatorSocketInjectionKey,
} from "./composables/useEdgecreatorSocket";

const session = {
  getToken: () => Promise.resolve(Cookies.get("token")),
  clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
  sessionExists: () =>
    Promise.resolve(typeof Cookies.get("token") === "string"),
};

provideLocal(
  edgecreatorSocketInjectionKey,
  useEdgecreatorSocket({
    session,
  }),
);

const dmSocket = useDmSocket({
  cacheStorage: buildWebStorage(sessionStorage),
  session,
  onConnectError: (e) => {
    console.error(e);
  },
});

provideLocal(dmSocketInjectionKey, dmSocket);
const route = useRoute();

const user = computed(() => webStores.collection().user);
const userPermissions = computed(() => webStores.collection().userPermissions);

webStores.collection().loadUser();

watch(
  () => user.value,
  (newValue) => {
    if (newValue !== null) {
      if (route.matched.length && !route.meta.public && userPermissions.value) {
        if (
          newValue &&
          !userPermissions.value?.some(
            ({ privilege, role }) =>
              role === "EdgeCreator" &&
              ["Edition", "Admin"].includes(privilege as string),
          )
        ) {
          location.replace("/");
        }
      }
    } else {
      location.replace(
        `${import.meta.env.VITE_DM_URL as string}/login?redirect=${
          window.location.href
        }`,
      );
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
