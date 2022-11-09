<template>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import { collection } from "~/stores/collection";

const router = useRouter();

onMounted(async () => {
  await collection().loadUser();
});
watch(
  () => collection().user,
  (newValue: never) => {
    if (newValue === null) {
      router.push("/login");
    }
  }
);
</script>

<style lang="scss">
@import "./styles/main.scss";
</style>
