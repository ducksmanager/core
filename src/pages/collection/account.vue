<route lang="yaml">
alias: [/collection/compte]
</route>

<template>
  <form
    v-if="user && marketplaceContactMethods"
    @submit.prevent="updateAccount"
  >
    <b-row>
      <b-col id="email" cols="12" md="6">
        <b-alert variant="warning" :show="!marketplaceContactMethods.length"
          >{{
            $t(
              "Vous n'avez pas indiqué de moyen de contact pour les collectionneurs intéressés par vos numéros."
            )
          }}<br />{{
            $t(
              "Si vous souhaitez vendre des numéros, indiquez au moins un moyen de contact."
            )
          }}</b-alert
        >
      </b-col>
    </b-row>
    <Teleport :disabled="!error?.selector" :to="error?.selector">
      <b-alert v-if="error?.message" show variant="danger">
        {{ error?.message }}
      </b-alert>
    </Teleport>

    <h5>{{ $t("Adresse e-mail") }}</h5>
    <b-row>
      <b-col id="email" cols="12" md="6">
        <b-form-input id="email" v-model="user.email" required autofocus />
      </b-col>
    </b-row>
    <b-row>
      <b-col id="showEmailToBuyers" cols="12" md="6">
        <b-form-checkbox v-model="hasEmailContactMethod" required autofocus>
          {{
            $t(
              "Montrer mon adresse e-mail aux collectionneurs qui souhaitent me contacter pour acheter mes numéros à vendre "
            )
          }}</b-form-checkbox
        >
      </b-col>
    </b-row>

    <h5>{{ $t("Identifiant de profil Discord") }}</h5>
    <b-row id="discordId">
      <b-col cols="12" md="6">
        <b-form-input v-model="user.discordId" />
      </b-col>
    </b-row>
    <b-row>
      <b-col id="showDiscordIfToBuyers" cols="12" md="6">
        <b-form-checkbox v-model="hasDiscordContactMethod" required autofocus>
          {{
            $t(
              "Montrer mon identifiant Discord aux collectionneurs qui souhaitent me contacter pour acheter mes numéros à vendre "
            )
          }}</b-form-checkbox
        >
      </b-col>
    </b-row>

    <h5>
      {{ $t("Texte de présentation") }}
    </h5>
    <b-row id="presentationText">
      <b-col cols="12" md="6">
        <b-alert variant="info" show class="mb-0">
          <template v-if="hasRequestedPresentationSentenceUpdate">
            {{
              $t(
                "Votre phrase de présentation est en cours de modération, un e-mail vous sera envoyé lorsqu'elle sera validée."
              )
            }}
          </template>
          <template v-else>
            {{
              $t(
                "Votre phrase de présentation sera soumise à modération. Les messages à caractère politique ou contraires à la loi ne sont pas acceptés."
              )
            }}
          </template>
        </b-alert>
        <b-form-input
          v-model="user.presentationText"
          class="mt-0"
          maxlength="100"
          :placeholder="
            $t('Présentez-vous en quelques mots (100 caractères maximum)')
          "
        /> </b-col
    ></b-row>
    <h5>{{ $t("Changement de mot de passe") }}</h5>
    <b-row id="oldPassword">
      <b-col cols="12" md="6">
        <b-form-input
          v-model="oldPassword"
          type="password"
          :placeholder="$t('Mot de passe actuel')"
        /> </b-col
    ></b-row>
    <b-row id="password">
      <b-col cols="12" md="6">
        <b-form-input
          v-model="password"
          type="password"
          :placeholder="$t('Nouveau mot de passe')"
        /> </b-col
    ></b-row>
    <b-row id="password2">
      <b-col cols="12" md="6">
        <b-form-input
          v-model="password2"
          type="password"
          :placeholder="$t('Nouveau mot de passe (confirmation)')"
        /> </b-col
    ></b-row>

    <h5>{{ $t("Options") }}</h5>
    <b-form-checkbox v-model="user.allowSharing">
      {{ $t("Activer le partage de ma collection") }}
    </b-form-checkbox>

    <b-form-checkbox v-model="user.showPresentationVideo">
      {{ $t("Afficher la vidéo d'explication pour la sélection des numéros") }}
    </b-form-checkbox>

    <b-button variant="success" size="xl" type="submit">
      {{ $t("Valider") }}
    </b-button>
    <b-alert v-if="error === null" show variant="success">
      {{ $t("OK") }} !
    </b-alert>

    <h5 class="mt-5">
      {{ $t("Zone danger") }}
    </h5>
    <div>
      <b-button variant="danger" @click="emptyCollection">
        {{ $t("Vider ma liste de numéros") }}
      </b-button>
    </div>
    <div>
      <b-button variant="danger" @click="deleteAccount">
        {{ $t("Supprimer mon compte DucksManager") }}
      </b-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import axios from "axios";
import { BAlert, BButton, BFormCheckbox, BFormInput } from "bootstrap-vue-3";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";
import { ScopedError } from "~types/ScopedError";

const user = $computed(() => collection().user);
let marketplaceContactMethods = $computed(
  () => collection().marketplaceContactMethods
);

let hasRequestedPresentationSentenceUpdate = $ref(false as boolean);
const oldPassword = $ref("" as string);
const password = $ref("" as string);
const password2 = $ref("" as string);
let error = $ref(undefined as ScopedError | null | undefined);

let hasEmailContactMethod = $ref(false as boolean);
let hasDiscordContactMethod = $ref(false as boolean);

const { t: $t } = useI18n();
const t = $t;
const router = useRouter();

const emptyCollection = async () => {
  if (confirm(t("Votre collection va être vidée. Continuer ?"))) {
    await axios.delete("/collection/empty");
    await router.push("/collection/show");
  }
};

const updateAccount = async () => {
  try {
    error = undefined;
    const response = (
      await axios.post("/collection/user", {
        ...user,
        oldPassword,
        password,
        password2,
      })
    ).data;
    hasRequestedPresentationSentenceUpdate =
      response.hasRequestedPresentationSentenceUpdate;
    error = null;

    collection().marketplaceContactMethods = [
      hasEmailContactMethod ? "email" : "",
      hasDiscordContactMethod ? "discord" : "",
    ].filter((value) => value);
    await collection().updateMarketplaceContactMethods();
  } catch (e) {
    error = e?.response?.data || t({ message: "Une erreur s'est produite." });
  }
};

const deleteAccount = async () => {
  if (
    confirm(
      t(
        "Votre compte DucksManager va être supprimé incluant toutes les informations de votre collection. Continuer ?"
      )
    )
  ) {
    await axios.delete("/collection/user");
    await router.push("/logout");
  }
};

onMounted(async () => {
  await collection().loadMarketplaceContactMethods();
});

watch(
  () => marketplaceContactMethods,
  (newValue: string[] | null) => {
    if (newValue) {
      hasEmailContactMethod = newValue.includes("email");
      hasDiscordContactMethod = newValue.includes("discord");
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
h5,
.btn {
  margin-top: 20px;
}
</style>
