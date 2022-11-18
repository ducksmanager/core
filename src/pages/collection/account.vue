<route lang="yaml">
alias: [/collection/compte]
</route>

<template>
  <form v-if="user" @submit.prevent="updateAccount">
    <BAlert v-if="error" variant="error"> {{ error }} ! </BAlert>
    <BAlert v-else-if="error === null" variant="success">
      {{ $t("OK") }} !
    </BAlert>

    <h5>{{ $t("Adresse e-mail") }}</h5>
    <BFormInput id="email" v-model="user.email" required autofocus />

    <h5>
      {{ $t("Texte de présentation") }}
    </h5>
    <BAlert variant="info" show class="mb-0">
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
    </BAlert>
    <BFormInput
      v-model="user.presentationText"
      class="mt-0"
      maxlength="100"
      :placeholder="
        $t('Présentez-vous en quelques mots (100 caractères maximum)')
      "
    />
    <h5>{{ $t("Changement de mot de passe") }}</h5>
    <BFormInput
      id="password"
      v-model="oldPassword"
      type="password"
      :placeholder="$t('Mot de passe actuel')"
    />
    <BFormInput
      id="passwordNew"
      v-model="newPassword"
      type="password"
      :placeholder="$t('Nouveau mot de passe')"
    />
    <BFormInput
      id="passwordNewConfirmation"
      v-model="newPassword2"
      type="password"
      :placeholder="$t('Nouveau mot de passe (confirmation)')"
    />

    <h5>{{ $t("Options") }}</h5>
    <BFormCheckbox id="share-enabled" v-model="user.allowSharing">
      {{ $t("Activer le partage de ma collection") }}
    </BFormCheckbox>

    <BFormCheckbox id="show-video" v-model="user.showPresentationVideo">
      {{ $t("Afficher la vidéo d'explication pour la sélection des numéros") }}
    </BFormCheckbox>

    <BButton variant="success" size="xl" type="submit">
      {{ $t("Valider") }}
    </BButton>

    <h5 class="mt-5">
      {{ $t("Zone danger") }}
    </h5>
    <div>
      <BButton variant="danger" @click="emptyCollection">
        {{ $t("Vider ma liste de numéros") }}
      </BButton>
    </div>
    <div>
      <BButton variant="danger" @click="deleteAccount">
        {{ $t("Supprimer mon compte DucksManager") }}
      </BButton>
    </div>
  </form>
</template>

<script setup>
import axios from "axios";
import { BAlert, BButton, BFormCheckbox, BFormInput } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";

const user = $computed(() => collection().user);

let hasRequestedPresentationSentenceUpdate = $ref(false);
const oldPassword = $ref("");
const newPassword = $ref("");
const newPassword2 = $ref("");
let error = $ref("");

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
    error = "";
    const response = (
      await axios.post("/collection/user", {
        ...user,
      })
    ).data;
    hasRequestedPresentationSentenceUpdate =
      response.hasRequestedPresentationSentenceUpdate;
    error = null;
  } catch (e) {
    error = e;
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
</script>

<style scoped lang="scss">
h5,
.btn {
  margin-top: 20px;
}
</style>
