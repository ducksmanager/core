<route lang="yaml">
meta:
  public: true
</route>

<template><div></div></template>

<script setup lang="ts">
import Cookies from "js-cookie";

const { loadUser } = collection();
const { user } = storeToRefs(collection());

const router = useRouter();

const { auth: authEvents } = inject(socketInjectionKey)!;

watch(
  user,
  async (newValue) => {
    if (newValue) {
      router.push("/collection");
    }
  },
  { immediate: true },
);

(async () => {
  const result = await authEvents.loginAsDemo();
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
})();
</script>
