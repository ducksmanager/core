<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div>
    <h2>{{ $t("Nouveau mot de passe") }}</h2>
    <b-alert v-if="initError" show variant="danger">{{ initError }}</b-alert>
    <form v-else method="post" @submit.prevent="changePassword">
      <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>
      <b-form-input
        id="password"
        v-model="password"
        type="password"
        :placeholder="$t('Nouveau mot de passe')"
      />
      <b-form-input
        id="password2"
        v-model="password2"
        type="password"
        :placeholder="$t('Nouveau mot de passe (confirmation)')"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";

const router = useRouter();
const collectionStore = collection();

let initError = $ref(null as AxiosError | null);
let error = $ref(null as unknown | null);
const token = useRoute().params.token;
const password = $ref("" as string);
const password2 = $ref("" as string);

const { t: $t } = useI18n();
const changePassword = async () => {
  try {
    Cookies.set(
      "token",
      (
        await axios.post("/auth/changePassword", {
          token,
          password,
          password2,
        })
      ).data.token
    );
  } catch (e: unknown) {
    error = (e as AxiosError)?.response?.data || "Error";
  }
};

onMounted(async () => {
  try {
    await axios.post("/auth/changePassword", {
      token,
      password,
      password2,
    });
    await collectionStore.loadUser();
  } catch (e: unknown) {
    initError = e as AxiosError;
  }
});

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
