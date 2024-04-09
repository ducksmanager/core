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
      <b-form-submit>{{ $t("OK") }}</b-form-submit>
    </form>
  </div>
</template>

<script setup lang="ts">
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

import { call } from "~axios-helper";

const router = useRouter();
const { loadUser } = collection();
const { user } = storeToRefs(collection());

let initError = $ref(null as AxiosError | null);
let error = $ref(null as unknown | null);
const token = useRoute().params.token as string;
const password = $ref("" as string);
const password2 = $ref("" as string);

const { t: $t } = useI18n();
const changePassword = async () => {
  try {
    Cookies.set(
      "token",
      (
        await call(
          axios,
          new POST__auth__change_password({
            reqBody: {
              token,
              password,
              password2,
            },
          }),
        )
      ).data.token,
      {
        domain: import.meta.env.VITE_COOKIE_DOMAIN,
      },
    );
    await loadUser();
  } catch (e: unknown) {
    error = (e as AxiosError)?.response?.data || "Error";
  }
};

(async () => {
  try {
    await call(
      axios,
      new GET__auth__forgot({
        query: { token },
      }),
    );
  } catch (e: unknown) {
    initError = e as AxiosError;
  }
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
