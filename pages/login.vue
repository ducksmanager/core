<template>
  <form @submit.prevent="login">
    <NuxtLayout name="default">
      <template #title>{{ $t("Connexion") }}</template>
      <template #page-title>{{ $t("Connexion") }}</template>
      <b-row>
        <b-col lg="6">
          <h1 class="h3 mb-3 fw-normal">
            {{ $t("Connexion") }}
          </h1>
          <b-alert v-if="error" show variant="danger">
            {{ error }}
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

          <b-button variant="primary" size="xl" type="submit">
            {{ $t("Connexion") }}
          </b-button>
          <div>
            <NuxtLink :href="r('/forgot')">{{
              $t("Mot de passe oublié ?")
            }}</NuxtLink>
          </div>
        </b-col>
      </b-row>
    </NuxtLayout>
  </form>
</template>

<script setup>
import { BAlert, BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";

import { form } from "../stores/form";
import { l10n } from "../stores/l10n";

defineProps({
  error: { type: String, default: null },
  lastUsername: { type: String, default: null },
});

const username = $ref("");
const password = $ref("");

const { r } = l10n();
const hasErrors = $computed(() => form().hasErrors);
const authState = useAuthState();

if (authState.value.loggedIn) {
  useRouter().push("/collection/show");
}

const login = async () => {
  form().clearErrors();

  if (hasErrors) {
    return;
  }
  await useFetch("/auth/login", {
    method: "POST",
    body: {
      username,
      password,
    },
  })
    .then(async (response) => {
      const { token: jwt, ...user } = response;
      authState.set({
        loggedIn: true,
        jwt,
        user,
      });
      await navigateTo({ path: "/collection/show" });
    })
    .catch((e) => {
      console.error(e);
      form().addErrors({
        username: $t(
          "Ce nom d'utilisateur ou cette adresse e-mail existe déjà."
        ),
      });
    });
};
</script>

<style scoped>

</style>
