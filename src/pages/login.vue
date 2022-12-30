<route lang="yaml">
alias: [/connexion]
meta:
  public: true
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
          size="lg"
          type="submit"
          :disabled="!csrfToken"
        >
          {{ $t("Connexion") }}
        </b-button>
        <div>
          <router-link to="/forgot">{{
            $t("Mot de passe oublié ?")
          }}</router-link>
        </div>
      </b-col>
    </b-row>
  </form>
</template>

<script setup lang="ts">
import axios from "axios";
import { BAlert, BButton, BCol, BFormInput, BRow } from "bootstrap-vue-3";
import Cookies from "js-cookie";

import { collection } from "~/stores/collection";
import routes from "~types/routes";

const collectionStore = collection();

let router = useRouter();
let route = useRoute();
const { error = null } = defineProps<{
  error?: string;
}>();

let csrfToken = $ref(null as string | null);
let username = $ref("" as string);
let password = $ref("" as string);

onMounted(async () => {
  csrfToken = (await routes["GET /csrf"](axios)).data?.csrfToken;
});

const login = async () => {
  try {
    Cookies.set(
      "token",
      (
        await routes["POST /login"](axios, {
          data: {
            username,
            password,
          },
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
</script>

<style scoped>

</style>
