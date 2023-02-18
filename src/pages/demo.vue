<route lang="yaml">
meta:
  public: true
</route>

<template><div></div></template>

<script setup lang="ts">
import axios from "axios";
import Cookies from "js-cookie";

import { collection } from "~/stores/collection";

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
    Cookies.set("token", (await POST__demo(axios)).data.token, {
      domain: ".ducksmanager.net",
    });
    await collectionStore.loadUser();
  } catch (e) {
    console.error(e);
  }
});
</script>
