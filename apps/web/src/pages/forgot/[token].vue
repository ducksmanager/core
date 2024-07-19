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
      <b-button type="submit">{{ $t("OK") }}</b-button>
    </form>
  </div>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import { dmSocketInjectionKey } from "../../composables/useDmSocket";

const { loadUser } = collection();

let initError = $ref<string | null>(null);
let error = $ref<string | null>(null);
const token = useRoute().params.token as string;
const password = $ref<string>("");
const password2 = $ref<string>("");

const { t: $t } = useI18n();

const {
  auth: { services: authServices },
} = injectLocal(dmSocketInjectionKey)!;

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
</script>
