<route lang="yaml">
alias: [/connexion]
</route>

<template>
  <form
    v-if="collectionStore.user === null"
    method="post"
    @submit.prevent="login"
  >
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

        <b-button
          variant="primary"
          size="xl"
          type="submit"
          :disabled="!csrfToken"
        >
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
import axios from "axios";
import { BAlert, BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import Cookies from "js-cookie";

import { collection } from "~/stores/collection";
import { l10n } from "~/stores/l10n";

const collectionStore = collection();

let router = useRouter();
let route = useRoute();
defineProps({
  error: { type: String, default: null },
});

let csrfToken = $ref(null);
let username = $ref("");
let password = $ref("");

onMounted(async () => {
  csrfToken = (await axios.get("/csrf")).data?.csrfToken;
});

const login = async () => {
  try {
    Cookies.set(
      "token",
      (
        await axios.post("/login", {
          username,
          password,
        })
      ).data.token
    );
    await collectionStore.loadUser();
  } catch (e) {
    console.error(e);
  }
};

watch(
  () => collectionStore.user,
  async (newValue) => {
    if (newValue) {
      if (route.query.redirect) {
        window.location.href = route.query.redirect + "";
      } else {
        await router.push("/collection");
      }
    }
  },
  { immediate: true }
);
const { r } = l10n();
</script>

<style scoped>

</style>
