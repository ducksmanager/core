<template>
  <router-view v-if="user" />
</template>

<script setup lang="ts">
import { collection } from "~/stores/collection";
const route = useRoute();

const user = computed(() => collection().user);
const userPermissions = computed(() => collection().userPermissions);

onMounted(async () => await collection().loadUser());

watch(
  () => userPermissions.value,
  (permissions) => {
    if (
      !route.meta.public &&
      !permissions?.find(
        ({ privilege, role }) =>
          role === "EdgeCreator" && ["Editor", "Admin"].includes(privilege)
      )
    ) {
      location.replace(`${import.meta.env.VITE_DM_API_URL}/login`);
    }
  }
);
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
