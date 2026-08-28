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
  (newValue) => {
    if (newValue) {
      router.push("/collection");
    }
  },
  { immediate: true },
);

(async () => {
  const result = await authEvents.loginAsDemo().catch((e) => {
    console.error(e.error);
  });
  if (result) {
    Cookies.set("token", result.token, {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
    await loadUser();
  }
})();
</script>
