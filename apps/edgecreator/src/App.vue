<template>
  <router-view v-if="user" />
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";
const route = useRoute();

const user = computed(() => collection().user);
const userPermissions = computed(() => collection().userPermissions);

collection().loadUser();

watchEffect(() => {
  if (user.value !== null) {
    if (!route.meta.public) {
      if (
        user.value &&
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
});
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
