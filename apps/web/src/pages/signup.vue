<route lang="yaml">
alias: [/inscription]
meta:
  public: true
</route>
<template>
  <h2>{{ $t("Inscription") }}</h2>
  <form method="post" @submit.prevent="signup">
    <scoped-error-teleport v-if="error" :error="error" />
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

    <b-button variant="primary" size="lg" type="submit">
      {{ $t("Inscription") }}
    </b-button>
  </form>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";

import type { ScopedError } from "~socket.io-services/types";

const { signup: userSignup, loadUser } = collection();
const { user } = storeToRefs(collection());
const router = useRouter();

let username = $ref(""),
  email = $ref(""),
  password = $ref(""),
  password2 = $ref(""),
  error = $ref<ScopedError | null | undefined>(undefined);

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
      if (e.selector) {
        error = e;
      } else {
        console.error(e);
      }
    },
  );
};

watch(
  user,
  async (newValue) => {
    if (newValue) {
      router.push("/collection");
    }
  },
  { immediate: true },
);
</script>
