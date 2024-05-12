<template>
  <router-view v-if="user" />
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";
import Cookies from "js-cookie";

import useEdgecreatorSocket, {
  edgecreatorSocketInjectionKey,
} from "./composables/useEdgecreatorSocket";
import { provideLocal } from "@vueuse/core";

provideLocal(
  edgecreatorSocketInjectionKey,
  useEdgecreatorSocket({
    session: {
      getToken: () => Promise.resolve(Cookies.get("token")),
      clearSession: () => {}, // Promise.resolve(Cookies.remove("token")),
      sessionExists: () =>
        Promise.resolve(typeof Cookies.get("token") === "string"),
    },
  })
);
const route = useRoute();

const user = computed(() => collection().user);
const userPermissions = computed(() => collection().userPermissions);

collection().loadUser();

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
              ["Edition", "Admin"].includes(privilege as string)
          )
        ) {
          location.replace("/");
        }
      }
    } else {
      location.replace(
        `${import.meta.env.VITE_DM_URL as string}/login?redirect=${
          window.location.href
        }`
      );
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
