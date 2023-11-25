<route lang="yaml">
meta:
  public: true
</route>

<template><div></div></template>

<script setup lang="ts">
import axios from "axios";
import Cookies from "js-cookie";

import { call } from "~axios-helper";

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

(async () => {
  try {
    Cookies.set("token", (await call(axios, new POST__demo())).data.token, {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
    await loadUser();
  } catch (e) {
    console.error(e);
  }
})();
</script>
