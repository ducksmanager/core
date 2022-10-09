<route lang="yaml">
alias: [/connexion]
</route>

<template>
  <form
    v-if="collectionStore.user === null"
    method="post"
    @submit.prevent="login"
  >
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
          v-model="username"
          name="username"
          type="text"
          required
          autofocus
          :placeholder="$t(`Nom d'utilisateur`)"
        />
        <BFormInput
          id="password"
          v-model="password"
          name="password"
          type="password"
          required
          :placeholder="$t('Mot de passe')"
        />

        <BButton
          variant="primary"
          size="xl"
          type="submit"
          :disabled="!csrfToken"
        >
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
import Cookies from "js-cookie";

import { collection } from "~/stores/collection";
import { l10n } from "~/stores/l10n";

const collectionStore = collection();

let router = useRouter();
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
  } catch (e) {
    console.error(e);
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
const { r } = l10n();
</script>

<style scoped>

</style>
