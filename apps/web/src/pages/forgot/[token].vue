<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div>
    <h2>{{ $t("Nouveau mot de passe") }}</h2>
    <b-alert v-if="initError" :model-value="true" variant="danger">{{
      initError
    }}</b-alert>
    <form v-else method="post" @submit.prevent="changePassword">
      <b-alert v-if="error" :model-value="true" variant="danger">{{
        error
      }}</b-alert>
      <b-form-input
        id="password"
        v-model="password"
        type="password"
        :placeholder="$t('Nouveau mot de passe')"
      />
      <b-form-input
        id="password2"
        v-model="password2"
        type="password"
        :placeholder="$t('Nouveau mot de passe (confirmation)')"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

const router = useRouter();
const { loadUser } = collection();
const { user } = storeToRefs(collection());

let initError = $ref(null as string | null);
let error = $ref(null as string | null);
const token = useRoute().params.token as string;
const password = $ref("" as string);
const password2 = $ref("" as string);

const { t: $t } = useI18n();
const changePassword = async () => {
  const response = await authServices.changePassword({
    token,
    password,
    password2,
  });
  if ("error" in response) {
    error = response.error!;
  } else {
    Cookies.set("token", token, {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
  }
};

(async () => {
  await changePassword();
  loadUser();
})();

watch(
  user,
  async (newValue) => {
    if (newValue) {
      await router.push("/collection");
    }
  },
  { immediate: true },
);
</script>
