<template>
  <BToastOrchestrator />
  <suspense><router-view /></suspense>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { buildWebStorage } from "socket-call-client";
import { stores as webStores } from "~web";
import useDmSocket, {
  socketInjectionKey as dmSocketInjectionKey,
} from "~web/src/composables/useDmSocket";

import useEdgecreatorSocket, {
  edgecreatorSocketInjectionKey,
} from "./composables/useEdgecreatorSocket";
import { getCurrentInstance } from "vue";
import { edgeCatalog } from "./stores/edgeCatalog";

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
    location.replace(
      `${import.meta.env.VITE_DM_URL as string}/login?redirect=${
        window.location.href
      }`,
    );
  }
};
getCurrentInstance()!.appContext.app.provide(
  edgecreatorSocketInjectionKey,
  useEdgecreatorSocket({
    session,
    onConnectError,
  }),
);

const dmSocket = useDmSocket({
  cacheStorage: buildWebStorage(sessionStorage),
  session,
  onConnectError,
});

getCurrentInstance()!.appContext.app.provide(dmSocketInjectionKey, dmSocket);
const route = useRoute();

const collectionStore = webStores.collection();
const { user, userPermissions } = storeToRefs(collectionStore);

try {
  collectionStore.loadUser();
  collectionStore.loadUserPermissions();
  edgeCatalog().fetchOngoingEdges();
} catch (e) {
  console.error(e);
}

watch(
  user,
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
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
@use "./styles/main.scss";
</style>
