<route lang="yaml">
meta:
  public: true
</route>

<template><div></div></template>

<script setup lang="ts">
import axios from "axios";
import Cookies from "js-cookie";

import { collection } from "~/stores/collection";
import { call } from "~/util/axios";
import { POST__demo } from "~types/routes";

const collectionStore = collection();

const router = useRouter();

watch(
  () => collectionStore.user,
  async (newValue) => {
    if (newValue) {
      await router.push("/collection");
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    Cookies.set("token", (await call(axios, new POST__demo())).data.token, {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
    await collectionStore.loadUser();
  } catch (e) {
    console.error(e);
  }
});
</script>
