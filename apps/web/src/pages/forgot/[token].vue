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

import { socketInjectionKey } from "../../composables/useDmSocket";

const { loadUser } = collection();
const route = useRoute<"/forgot/[token]">();

let initError = $ref<string>();
let error = $ref<string>();
const token = computed(() => route.params.token);
const password = $ref("");
const password2 = $ref("");

const { t: $t } = useI18n();

const { auth: authEvents } = inject(socketInjectionKey)!;

const changePassword = async () => {
  if (!token.value) {
    initError = "Token not found";
    return;
  }
  const response = await authEvents.changePassword({
    token: token.value,
    password,
    password2,
  });
  if ("error" in response) {
    error = response.error!;
  } else {
    Cookies.set("token", token.value, {
      domain: import.meta.env.VITE_COOKIE_DOMAIN,
    });
  }
};

(async () => {
  await changePassword();
  loadUser();
})();
</script>
