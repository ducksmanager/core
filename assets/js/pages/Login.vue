<template>
  <form method="post">
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
          name="username"
          type="text"
          required
          autofocus
          :value="lastUsername"
          :placeholder="$t(`Nom d'utilisateur`)"
        />
        <b-form-input
          id="password"
          name="password"
          type="password"
          required
          :placeholder="$t('Mot de passe')"
        />

        <input type="hidden" name="_csrf_token" :value="csrfToken" />

        <b-button variant="primary" size="xl" type="submit">
          {{ $t("Connexion") }}
        </b-button>
        <div>
          <a :href="r('/forgot')">{{ $t("Mot de passe oublié ?") }}</a>
        </div>
      </b-col>
    </b-row>
  </form>
</template>

<script setup>
import { BAlert, BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";

import { l10n } from "../../../stores/l10n";

defineProps({
  error: { type: String, default: null },
  lastUsername: { type: String, default: null },
});

const csrfToken = document.getElementById("csrf").value;
const { r } = l10n();
</script>

<style scoped>

</style>
