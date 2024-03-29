<route lang="yaml">
alias: [/connexion]
meta:
  public: true
</route>

<template>
  <form v-if="user === null" method="post" @submit.prevent="login">
    <b-row>
      <b-col lg="6">
        <h1 class="h3 mb-3 fw-normal">
          {{ $t("Connexion") }}
        </h1>
        <b-alert v-if="error" :model-value="true" variant="danger">
          {{
            $t(
              "Les identifiants que vous avez entré sont invalides, veuillez réessayer.",
            )
          }}
        </b-alert>
        <b-form-input
          id="username"
          v-model="username"
          name="username"
          type="text"
          required
          autofocus
          :placeholder="$t(`Nom d'utilisateur`)"
        />
        <b-form-input
          id="password"
          v-model="password"
          name="password"
          type="password"
          required
          :placeholder="$t('Mot de passe')"
        />

        <b-button
          variant="primary"
          size="lg"
          type="submit"
          :disabled="!csrfToken"
        >
          {{ $t("Connexion") }}
        </b-button>
        <div>
          <router-link to="/forgot">{{
            $t("Mot de passe oublié ?")
          }}</router-link>
        </div>
      </b-col>
    </b-row>
  </form>
</template>

<script setup lang="ts">
import axios from "axios";
import Cookies from "js-cookie";

import { call } from "~axios-helper";

const { login: userLogin, loadUser } = collection();
const { user } = storeToRefs(collection());

let router = useRouter();
let route = useRoute();

let csrfToken = $ref(null as string | null);
let username = $ref("" as string);
let error = $ref(null as string | null);
let password = $ref("" as string);

const login = async () => {
  await userLogin(
    username,
    password,
    async (newToken) => {
      const domain = import.meta.env.VITE_COOKIE_DOMAIN;
      Cookies.set("token", newToken, {
        domain,
      });
      await loadUser();
    },
    (e) => {
      error = e.message;
    },
  );
};

watch(
  user,
  async (newValue) => {
    if (newValue) {
      if (route.query.redirect) {
        window.location.href = route.query.redirect as string;
      } else {
        await router.push("/collection");
      }
    }
  },
  { immediate: true },
);

(async () => {
  csrfToken = (await call(axios, new GET__csrf())).data?.csrfToken;
})();
</script>
