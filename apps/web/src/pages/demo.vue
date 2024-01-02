<route lang="yaml">
meta:
  public: true
</route>

<template><div></div></template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { demoServices } from "~/composables/useSocket";
const { loadUser } = collection();
const { user } = storeToRefs(collection());

const router = useRouter();

watch(
  user,
  async (newValue) => {
    if (newValue) {
      await router.push("/collection");
    }
  },
  { immediate: true },
);

async () => {
  const result = await demoServices.loginAsDemo();
  switch (result.error) {
    case "No demo user found":
      console.error(result.error);
      break;
    case undefined:
      Cookies.set("token", result.token, {
        domain: import.meta.env.VITE_COOKIE_DOMAIN,
      });
      await loadUser();
  }
};
</script>
