<template>
  <router-view v-if="user" />
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";
const route = useRoute();

const user = computed(() => collection().user);
const userPermissions = computed(() => collection().userPermissions);

collection().loadUser();

watch(
  () => userPermissions.value,
  (permissions) => {
    if (!route.meta.public && user.value) {
      if (
        !permissions?.some(
          ({ privilege, role }) =>
            role === "EdgeCreator" && ["Edition", "Admin"].includes(privilege)
        )
      ) {
        location.replace("/");
      }
    } else {
      location.replace(
        `${import.meta.env.VITE_DM_URL as string}/login?redirect=${
          window.location.href
        }`
      );
    }
  }
);
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
