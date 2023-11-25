<route lang="yaml">
alias: [/inscription]
meta:
  public: true
</route>
<template>
  <h2>{{ $t("Inscription") }}</h2>
  <form method="post" @submit.prevent="signup">
    <scoped-error-teleport v-if="error" :error="error" />
    <input type="hidden" name="_csrf_token" :value="csrfToken" />
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="username"
          v-model="username"
          name="username"
          type="text"
          required
          autofocus
          :placeholder="$t(`Nom d'utilisateur`)"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="email"
          v-model="email"
          name="email"
          type="text"
          required
          :placeholder="$t('Adresse e-mail')"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="password"
          v-model="password"
          name="password"
          type="password"
          required
          :placeholder="$t('Mot de passe (au moins 6 caractères)')"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="password2"
          v-model="password2"
          name="password2"
          type="password"
          required
          :placeholder="$t('Mot de passe (confirmation)')"
        />
      </b-col>
    </b-row>

    <b-button variant="primary" size="lg" type="submit" :disabled="!csrfToken">
      {{ $t("Inscription") }}
    </b-button>
  </form>
</template>

<script setup lang="ts">
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

import { call } from "~axios-helper";
import { ScopedError } from "~dm-types/ScopedError";

const { signup: userSignup, loadUser } = collection();
const { user } = storeToRefs(collection());
const router = useRouter();

let csrfToken = $ref(null as string | null);
let username = $ref("" as string),
  email = $ref("" as string),
  password = $ref("" as string),
  password2 = $ref("" as string),
  error = $ref(undefined as ScopedError | null | undefined);

const { t: $t } = useI18n();

const signup = async () => {
  await userSignup(
    username,
    password,
    password2,
    email,
    async (newToken) => {
      Cookies.set("token", newToken, {
        domain: import.meta.env.VITE_COOKIE_DOMAIN,
      });
      await loadUser();
    },
    (e) => {
      error = ((e as AxiosError)?.response?.data as ScopedError) || {
        message: $t("Une erreur s'est produite."),
      };
    },
  );
};

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
  csrfToken = (await call(axios, new GET__csrf())).data?.csrfToken;
})();
</script>
