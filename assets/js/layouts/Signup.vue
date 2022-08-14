<template>
  <form method="post">
    <b-alert v-if="error" show variant="danger">
      {{
        $t(
          "Une erreur s'est produite. Assurez vous que le nom d'utilisateur et l'adresse e-mail entrés ne correspondent pas à un utilisateur existant."
        )
      }}
    </b-alert>
    <input type="hidden" name="_csrf_token" :value="csrfToken" />
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
</template>

<script setup>
import { BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import Errorable from "../components/Errorable";
import { form } from "../stores/form";
import { l10n } from "../stores/l10n";

const signupProps = defineProps({
  lastUsername: { type: String, default: null },
  error: { type: String, default: null },
});

let signupUsername = $ref(""),
  email = $ref(""),
  password = $ref(""),
  password2 = $ref("");

const { r } = l10n(),
  { t: $t } = useI18n(),
  csrfToken = document.getElementById("csrf").value,
  hasErrors = $computed(() => form().hasErrors);

onMounted(() => {
  signupUsername = signupProps.lastUsername;
});
</script>

<style scoped>

</style>
