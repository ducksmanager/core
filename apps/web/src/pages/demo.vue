<route lang="yaml">
meta:
  public: true
</route>

<template><div></div></template>

<script setup lang="ts">
import Cookies from "js-cookie";
import { isEventErrorOf } from "~/composables/useDmSocket";

const { loadUser } = collection();
const { user } = storeToRefs(collection());

const router = useRouter();

const { auth: authEvents } = inject(socketInjectionKey)!;

watch(
  user,
  async (newValue) => {
    if (newValue) {
      await router.push("/collection");
    }
  },
  { immediate: true },
);

void (async () => {
  const result = await authEvents.loginAsDemo().catch((e: unknown) => {
    console.error(isEventErrorOf(authEvents.loginAsDemo, e) ? e.error : e);
  });
  if (result) {
    Cookies.set("token", result.token, {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
    await loadUser();
  }
})();
</script>
