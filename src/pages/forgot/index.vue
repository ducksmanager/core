<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div>
    <b-alert v-if="token" :model-value="true" variant="info">{{
      $t(
        `Si l'e-mail indiqué correspond à un compte DucksManager, un lien permettant de modifier votre mot de passe vient
      d'y être envoyé. Si l'e-mail ne vous parvient pas d'ici quelques minutes, pensez à vérifier le dossier Spam.`
      )
    }}</b-alert>
    <form v-else method="post" @submit.prevent="sendPasswordToken">
      <b-alert v-if="error" :model-value="true" variant="danger">{{
        error
      }}</b-alert>
      <div>
        {{
          $t(
            "Un lien vous permettant de réinitialiser votre mot de passe va être envoyé à l'adresse que vous indiquerez ci-dessous."
          )
        }}
        <b-form-row>
          <b-col sm="6">
            <b-form-input
              id="email"
              v-model="email"
              type="text"
              required
              autofocus
              :placeholder="$t('Adresse e-mail')"
            />
          </b-col>
        </b-form-row>
      </div>
      <b-form-row>
        <b-col sm="4">
          <b-button type="submit">
            {{ $t("Envoyer") }}
          </b-button>
        </b-col>
      </b-form-row>
    </form>
  </div>
</template>

<script setup lang="ts">
import axios, { AxiosError } from "axios";
import { useI18n } from "vue-i18n";

import { call } from "~/util/axios";
import { POST__auth__forgot } from "~types/routes";

let error = $ref(null as unknown | string | null);

const email = $ref("" as string);
let token = $ref("" as string);
const { t: $t } = useI18n();

const sendPasswordToken = async () => {
  try {
    token = (
      await call<POST__auth__forgot>(axios, {
        reqBody: { email },
      })
    ).data.token;
  } catch (e) {
    error = (e as AxiosError)?.response?.data || "Error";
  }
};
</script>

<style scoped></style>
