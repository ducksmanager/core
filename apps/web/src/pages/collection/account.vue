<route lang="yaml">
alias: [/collection/compte]
</route>

<template>
  <form
    v-if="userForAccountForm && marketplaceContactMethods"
    @submit.prevent="updateAccount"
  >
    <b-row>
      <b-col id="email" cols="12" md="6">
        <b-alert
          variant="warning"
          :model-value="!marketplaceContactMethods.length"
          >{{
            $t(
              "Vous n'avez pas indiqué de moyen de contact pour les collectionneurs intéressés par vos numéros.",
            )
          }}<br />{{
            $t(
              "Si vous souhaitez vendre des numéros, indiquez au moins un moyen de contact.",
            )
          }}</b-alert
        >
      </b-col>
    </b-row>
    <scoped-error-teleport v-if="error" :error="error" />

    <h5>{{ $t("Adresse e-mail") }}</h5>
    <b-row>
      <b-col id="email" cols="12" md="6">
        <b-form-input
          id="email"
          v-model="userForAccountForm.email"
          required
          autofocus
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col id="showEmailToBuyers" cols="12" md="6">
        <b-form-checkbox
          v-model="hasEmailContactMethod"
          required
          autofocus
          :disabled="!userForAccountForm.email"
        >
          {{
            $t(
              "Montrer mon adresse e-mail aux collectionneurs qui souhaitent me contacter pour acheter mes numéros à vendre",
            )
          }}
          <template v-if="!userForAccountForm.email"
            >({{
              $t(
                "Vous devez spécifier une adresse e-mail pour activer cette option",
              )
            }})</template
          >
        </b-form-checkbox>
      </b-col>
    </b-row>

    <h5>{{ $t("Identifiant de profil Discord") }}</h5>
    <b-row>
      <b-col cols="12" md="6">
        <b-form-input
          id="discordId"
          v-model="userForAccountForm.discordId"
          type="text"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col id="showDiscordIfToBuyers" cols="12" md="6">
        <accordion
          id="discord-id"
          accordion-group-id="discord-id"
          :visible="false"
        >
          <template #header>{{
            $t("Comment trouver mon identifiant de profil Discord ?")
          }}</template>
          <template #content
            ><div class="text-black mb-2">
              {{
                $t(
                  'Vous pouvez trouver votre identifiant de profil Discord en vous rendant dans le menu "Paramètres utilisateur" > "Mon compte". Faites un clic droit sur "..." puis cliquez sur "Copier l\'identifiant de l\'utilisateur".',
                )
              }}
            </div>
            <img
              :src="getImagePath(`discord-id/${locale}.png`)"
              class="w-100"
            />
          </template>
        </accordion>
        <b-form-checkbox
          v-model="hasDiscordContactMethod"
          required
          autofocus
          :disabled="!userForAccountForm.discordId"
        >
          {{
            $t(
              "Montrer mon identifiant Discord aux collectionneurs qui souhaitent me contacter pour acheter mes numéros à vendre",
            )
          }}
          <template v-if="!userForAccountForm.discordId"
            >({{
              $t(
                "Vous devez spécifier un identifiant de profil Discord pour activer cette option",
              )
            }})</template
          ></b-form-checkbox
        >
      </b-col>
    </b-row>

    <h5>{{ $t("Marketplace") }}</h5>
    <b-row>
      <b-col cols="12" md="6">
        <b-form-checkbox
          v-model="userForAccountForm.marketplaceAcceptsExchanges"
        >
          {{
            $t(
              "Indiquer aux autres utilisateurs que je suis disposé à échanger des magazines, et pas seulement à en acheter ou en vendre.",
            )
          }}
        </b-form-checkbox>
      </b-col>
    </b-row>

    <h5>
      {{ $t("Texte de présentation") }}
    </h5>
    <b-row>
      <b-col cols="12" md="6">
        <b-alert variant="info" :model-value="true" class="mb-0">
          <template v-if="hasRequestedPresentationSentenceUpdate">
            {{
              $t(
                "Votre phrase de présentation est en cours de modération, un e-mail vous sera envoyé lorsqu'elle sera validée.",
              )
            }}
          </template>
          <template v-else>
            {{
              $t(
                "Votre phrase de présentation sera soumise à modération. Les messages à caractère politique ou contraires à la loi ne sont pas acceptés.",
              )
            }}
          </template>
        </b-alert>
        <b-form-input
          id="presentationText"
          v-model="userForAccountForm.presentationText"
          class="mt-0"
          maxlength="100"
          :placeholder="
            $t('Présentez-vous en quelques mots (100 caractères maximum)')
          "
        /> </b-col
    ></b-row>
    <h5>{{ $t("Changement de mot de passe") }}</h5>
    <b-row>
      <b-col cols="12" md="6">
        <b-form-input
          id="oldPassword"
          v-model="oldPassword"
          type="password"
          :placeholder="$t('Mot de passe actuel')"
        /> </b-col
    ></b-row>
    <b-row>
      <b-col cols="12" md="6">
        <b-form-input
          id="password"
          v-model="password"
          type="password"
          :placeholder="$t('Nouveau mot de passe')"
        /> </b-col
    ></b-row>
    <b-row>
      <b-col cols="12" md="6">
        <b-form-input
          id="password2"
          v-model="password2"
          type="password"
          :placeholder="$t('Nouveau mot de passe (confirmation)')"
        /> </b-col
    ></b-row>

    <h5>{{ $t("Options") }}</h5>
    <b-form-checkbox v-model="userForAccountForm!.allowSharing">
      {{ $t("Activer le partage de ma collection") }}
    </b-form-checkbox>

    <b-button variant="success" size="lg" type="submit">
      {{ $t("Valider") }}
    </b-button>
    <b-alert v-if="error === null" :model-value="true" variant="success">
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
import type { ScopedError } from "socket-call-client";

const { getImagePath } = images();

const i18n = useI18n();

const locale = $computed(() => getCurrentLocaleShortKey(i18n.locale.value));

let hasRequestedPresentationSentenceUpdate = $ref(false);
const oldPassword = $ref("");
const password = $ref("");
const password2 = $ref("");
let error = $ref<ScopedError | null>();

let hasEmailContactMethod = $ref(false);
let hasDiscordContactMethod = $ref(false);

const { t: $t } = useI18n();
const t = $t;
const router = useRouter();

const { updateMarketplaceContactMethods, loadMarketplaceContactMethods } =
  collection();
const { userForAccountForm, marketplaceContactMethods } =
  storeToRefs(collection());

const { collection: collectionEvents } = inject(socketInjectionKey)!;

const emptyCollection = async () => {
  if (confirm(t("Votre collection va être vidée. Continuer ?"))) {
    await collectionEvents.emptyCollection();
    router.push("/collection/show");
  }
};

const updateAccount = async () => {
  error = undefined;
  const response = await collectionEvents.updateUser({
    ...userForAccountForm.value!,
    oldPassword,
    password,
    password2,
  });
  if ("error" in response) {
    if ("selector" in response) {
      error = response as ScopedError;
    } else {
      console.error(response.error);
    }
  } else {
    hasRequestedPresentationSentenceUpdate =
      response.hasRequestedPresentationSentenceUpdate;
    error = null;

    marketplaceContactMethods.value = [
      hasEmailContactMethod ? "email" : "",
      hasDiscordContactMethod ? "discordId" : "",
    ].filter((value) => value);
    await updateMarketplaceContactMethods();
  }
};

const deleteAccount = async () => {
  if (
    confirm(
      t(
        "Votre compte DucksManager va être supprimé incluant toutes les informations de votre collection. Continuer ?",
      ),
    )
  ) {
    await collectionEvents.deleteUser();
    router.push("/logout");
  }
};

loadMarketplaceContactMethods();

watch(
  marketplaceContactMethods,
  (newValue) => {
    if (newValue) {
      hasEmailContactMethod = newValue.includes("email");
      hasDiscordContactMethod = newValue.includes("discordId");
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
h5,
.btn {
  margin-top: 20px;
}
</style>
