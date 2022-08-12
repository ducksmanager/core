<template>
  <form method="post">
    <BRow>
      <BCol lg="6">
        <h1 class="h3 mb-3 fw-normal">
          {{ $t("Connexion") }}
        </h1>
        <BAlert v-if="error" show variant="danger">
          {{ error }}
        </BAlert>
        <BFormInput
          id="username"
          name="username"
          type="text"
          required
          autofocus
          :value="lastUsername"
          :placeholder="$t(`Nom d'utilisateur`)"
        />
        <BFormInput
          id="password"
          name="password"
          type="password"
          required
          :placeholder="$t('Mot de passe')"
        />

        <input type="hidden" name="_csrf_token" :value="csrfToken">

        <BButton variant="primary" size="xl" type="submit">
          {{ $t("Connexion") }}
        </BButton>
        <div>
          <a :href="r('/forgot')">{{ $t("Mot de passe oublié ?") }}</a>
        </div>
      </BCol>
    </BRow>
  </form>
</template>

<script setup>
import { BAlert, BButton, BCol, BFormInput, BRow } from 'bootstrap-vue-3'

import { l10n } from '~/stores/l10n'

defineProps({
  error: { type: String, default: null },
  lastUsername: { type: String, default: null },
})

const csrfToken = document.getElementById('csrf').value
const { r } = l10n()
</script>

<style scoped>

</style>
