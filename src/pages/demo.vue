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
    Cookies.set("token", (await axios.post("/demo")).data.token);
    await collectionStore.loadUser();
  } catch (e) {
    console.error(e);
  }
});
</script>

<style lang="scss" scoped>

</style>
