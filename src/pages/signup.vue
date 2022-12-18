<route lang="yaml">
alias: [/inscription]
</route>
<template>
  <h2>{{ $t("Inscription") }}</h2>
  <form method="post" @submit.prevent="signup">
    <b-alert v-if="error" show variant="danger">
      {{ $t(error as string) }}
    </b-alert>
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
import { BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import Cookies from "js-cookie";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";

const collectionStore = collection();
const router = useRouter();

let csrfToken = $ref(null as string | null);
let username = $ref("" as string),
  email = $ref("" as string),
  password = $ref("" as string),
  password2 = $ref("" as string),
  error = $ref("" as string | unknown);

const { t: $t } = useI18n();

onMounted(async () => {
  csrfToken = (await axios.get("/csrf")).data?.csrfToken;
});

const signup = async () => {
  try {
    Cookies.set(
      "token",
      (
        await axios.put("/collection/user", {
          username,
          password,
          password2,
          email,
        })
      ).data.token
    );
    await collectionStore.loadUser();
  } catch (e) {
    error = (e as AxiosError)?.response?.data || "Error";
  }
};

watch(
  () => collectionStore.user,
  async (newValue) => {
    if (newValue) {
      await router.push("/collection");
    }
  },
  { immediate: true }
);
</script>

<style scoped>

</style>
