<route lang="yaml">
alias: [/collection/compte]
</route>

<template>
  <form v-if="user" @submit.prevent="updateAccount">
    <Teleport :disabled="!error?.selector" :to="error?.selector">
      <BAlert v-if="error?.message" show variant="danger">
        {{ error?.message }}
      </BAlert>
    </Teleport>

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
    <div id="presentationText">
      <BFormInput
        v-model="user.presentationText"
        class="mt-0"
        maxlength="100"
        :placeholder="
          $t('Présentez-vous en quelques mots (100 caractères maximum)')
        "
      />
    </div>
    <h5>{{ $t("Changement de mot de passe") }}</h5>
    <div id="oldPassword">
      <BFormInput
        v-model="oldPassword"
        type="password"
        :placeholder="$t('Mot de passe actuel')"
      />
    </div>
    <div id="password">
      <BFormInput
        v-model="password"
        type="password"
        :placeholder="$t('Nouveau mot de passe')"
      />
    </div>
    <div id="password2">
      <BFormInput
        v-model="password2"
        type="password"
        :placeholder="$t('Nouveau mot de passe (confirmation)')"
      />
    </div>

    <h5>{{ $t("Options") }}</h5>
    <BFormCheckbox v-model="user.allowSharing">
      {{ $t("Activer le partage de ma collection") }}
    </BFormCheckbox>

    <BFormCheckbox v-model="user.showPresentationVideo">
      {{ $t("Afficher la vidéo d'explication pour la sélection des numéros") }}
    </BFormCheckbox>

    <BButton variant="success" size="xl" type="submit">
      {{ $t("Valider") }}
    </BButton>
    <BAlert v-if="error === null" show variant="success">
      {{ $t("OK") }} !
    </BAlert>

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

<script setup lang="ts">
import axios from "axios";
import { BAlert, BButton, BFormCheckbox, BFormInput } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";
import { ScopedError } from "~types/ScopedError";

const user = $computed(() => collection().user);

let hasRequestedPresentationSentenceUpdate = $ref(false as boolean);
const oldPassword = $ref("" as string);
const password = $ref("" as string);
const password2 = $ref("" as string);
let error = $ref(undefined as ScopedError | null | undefined);

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
</script>

<style scoped lang="scss">
h5,
.btn {
  margin-top: 20px;
}
</style>
