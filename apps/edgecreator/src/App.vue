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
  () => user.value,
  (newValue) => {
    console.log(`newValue=${JSON.stringify(newValue)}`);
    if (newValue !== null) {
      if (!route.meta.public) {
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
