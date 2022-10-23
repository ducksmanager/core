<route lang="yaml">
alias: [/collection/compte]
</route>

<template>
  <form v-if="user" method="post">
    <BAlert v-if="isSuccess" variant="success"> {{ $t("OK") }} ! </BAlert>

    <h5>{{ $t("Adresse e-mail") }}</h5>
    <Errorable id="email">
      <BFormInput
        id="email"
        v-model="user.email"
        name="email"
        required
        autofocus
      />
    </Errorable>

    <h5>
      {{ $t("Phrase de présentation") }} <sup>{{ $t("Nouveau !") }}</sup>
    </h5>
    <BAlert variant="info" show class="mb-0">
      <template v-if="hasRequestedPresentationSentence">
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
    <Errorable id="presentationSentenceRequest">
      <BFormInput
        id="presentationSentenceRequest"
        v-model="user.presentationSentence"
        class="mt-0"
        name="presentationSentenceRequest"
        maxlength="100"
        :placeholder="
          $t('Présentez-vous en quelques mots (100 caractères maximum)')
        "
        @input="user.presentationSentenceRequest = $event"
      />
    </Errorable>
    <h5>{{ $t("Changement de mot de passe") }}</h5>
    <Errorable id="password">
      <BFormInput
        id="password"
        name="password"
        type="password"
        :placeholder="$t('Mot de passe actuel')"
      />
    </Errorable>
    <Errorable id="passwordNew">
      <BFormInput
        id="passwordNew"
        name="passwordNew"
        type="password"
        :placeholder="$t('Nouveau mot de passe')"
      />
    </Errorable>
    <Errorable id="passwordNewConfirmation">
      <BFormInput
        id="passwordNewConfirmation"
        name="passwordNewConfirmation"
        type="password"
        :placeholder="$t('Nouveau mot de passe (confirmation)')"
      />
    </Errorable>

    <h5>{{ $t("Options") }}</h5>
    <BFormCheckbox
      id="share-enabled"
      v-model="user.isShareEnabled"
      name="isShareEnabled"
    >
      {{ $t("Activer le partage de ma collection") }}
    </BFormCheckbox>

    <BFormCheckbox
      id="show-video"
      v-model="user.isVideoShown"
      name="isVideoShown"
    >
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
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

import { collection } from "~/stores/collection";
import { form } from "~/stores/form";
import { l10n } from "~/stores/l10n";
const { errors, hasrequestedpresentationsentence, success } = defineProps({
  errors: { type: String, default: "" },
  success: { type: String, default: null },
  hasrequestedpresentationsentence: { type: String, default: null },
});

const user = $computed(() => collection().user);
const isSuccess = $computed(() =>
  success === null ? null : parseInt(success) === 1
);
const hasRequestedPresentationSentence = $computed(() =>
  hasrequestedpresentationsentence === null
    ? null
    : parseInt(hasrequestedpresentationsentence) === 1
);

const { t: $t } = useI18n();
const t = $t;
const { r } = l10n();
const router = useRouter();

onMounted(async () => {
  form().addErrors(JSON.parse(errors));
});

const emptyCollection = async () => {
  if (confirm(t("Votre collection va être vidée. Continuer ?"))) {
    await axios.delete("/collection/empty");
    await router.push("/collection/show");
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
