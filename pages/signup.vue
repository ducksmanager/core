<template>
  <div>
    <NuxtLayout name="default">
      <template #title>{{ $t("Inscription") }}</template>
      <template #page-title>{{ $t("Inscription") }}</template>
      <form method="post" @submit.prevent="signup">
        <b-row>
          <b-col lg="4">
            <Errorable id="username">
              <b-form-input
                id="username"
                v-model="signupUsername"
                name="username"
                type="text"
                required
                autofocus
                :placeholder="$t(`Nom d'utilisateur`)"
              />
            </Errorable>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="4">
            <Errorable id="email">
              <b-form-input
                id="email"
                v-model="email"
                name="email"
                type="text"
                required
                :placeholder="$t('Adresse e-mail')"
              />
            </Errorable>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="4">
            <Errorable id="password">
              <b-form-input
                id="password"
                v-model="password"
                name="password"
                type="password"
                required
                :placeholder="$t('Mot de passe (au moins 6 caractères)')"
              />
            </Errorable>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="4">
            <Errorable id="password2">
              <b-form-input
                id="password2"
                v-model="password2"
                name="password2"
                type="password"
                required
                :placeholder="$t('Mot de passe (confirmation)')"
              />
            </Errorable>
          </b-col>
        </b-row>

        <b-button variant="primary" size="xl" type="submit">
          {{ $t("Inscription") }}
        </b-button>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

import { form } from "../stores/form";

const signupUsername = $ref("");
const email = $ref("");
const password = $ref("");
const password2 = $ref("");
const authState = useAuthState();

const t = useI18n().t;
const hasErrors = $computed(() => form().hasErrors);
const signup = async () => {
  const { validatePasswords, validateEmail, validateUsername } = validation(t);

  form().clearErrors();
  validatePasswords(password, password2);
  validateEmail(email);
  validateUsername(signupUsername);

  if (hasErrors) {
    return;
  }
  await useFetch("/auth/signup", {
    method: "PUT",
    body: {
      username: signupUsername,
      password,
      password2,
      email,
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
