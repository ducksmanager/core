<route lang="yaml">
alias: [/connexion]
</route>

<template>
  <form method="post" @submit.prevent="login">
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
          v-model="username"
          :placeholder="$t(`Nom d'utilisateur`)"
        />
        <BFormInput
          id="password"
          name="password"
          type="password"
          v-model="password"
          required
          :placeholder="$t('Mot de passe')"
        />

        <BButton variant="primary" size="xl" type="submit" :disabled="!csrfToken">
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
import axios from "axios";
import { BAlert, BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import { l10n } from "~/stores/l10n";
import { collection } from "~/stores/collection";

let router = useRouter();
defineProps({
  error: { type: String, default: null }
});

let csrfToken = $ref(null);
let username = $ref('');
let password = $ref('');

onMounted(async () => {
  csrfToken = (await axios.get("/csrf")).data?.csrfToken;
});

const login = async () => {
  try {
    let token = (await axios.post("/login", {
      username, password
    })).data.token;
    collection().setToken(token)
    await router.push('/collection')
  }
  catch(e) {
    console.error(e)
  }
}
const { r } = l10n();
</script>

<style scoped>

</style>
