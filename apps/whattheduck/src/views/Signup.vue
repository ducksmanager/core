<template>
  <ion-page>
    <ion-header>
      <ion-title class="ion-no-padding">{{ t('Inscription') }}</ion-title>
    </ion-header>
    <ion-content>
      <ion-input
        v-model="username"
        :class="{
          'ion-valid': validInputs.includes('username'),
          'ion-invalid': invalidInputs.includes('username'),
          'ion-touched': touchedInputs.includes('username'),
        }"
        :aria-label="t('Nom d\'utilisateur DucksManager')"
        :placeholder="t('Nom d\'utilisateur DucksManager')"
        @ion-blur="touchedInputs.push('username')"
      />
      <ion-input
        v-model="email"
        :class="{
          'ion-valid': validInputs.includes('email'),
          'ion-invalid': invalidInputs.includes('email'),
          'ion-touched': touchedInputs.includes('email'),
        }"
        :aria-label="t('Adresse e-mail')"
        :placeholder="t('Adresse e-mail')"
        @ion-blur="touchedInputs.push('email')"
      />
      <ion-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :class="{
          'ion-valid': validInputs.includes('password'),
          'ion-invalid': invalidInputs.includes('password'),
          'ion-touched': touchedInputs.includes('password'),
        }"
        :error-text="t('Erreur')"
        :aria-label="t('Mot de passe')"
        :placeholder="t('Mot de passe')"
        @ion-blur="touchedInputs.push('password')"
      >
        <ion-icon
          style="float: right"
          :ios="showPassword ? eyeOffOutline : eyeOutline"
          :md="showPassword ? eyeOffSharp : eyeSharp"
          @click="showPassword = !showPassword"
        />
      </ion-input>
      <ion-input
        v-model="passwordConfirmation"
        :type="showPasswordConfirmation ? 'text' : 'password'"
        :class="{
          'ion-valid': validInputs.includes('passwordConfirmation'),
          'ion-invalid': invalidInputs.includes('passwordConfirmation'),
          'ion-touched': touchedInputs.includes('passwordConfirmation'),
        }"
        :error-text="errorTexts.passwordConfirmation"
        :aria-label="t('Confirmation mot de passe')"
        :placeholder="t('Confirmation mot de passe')"
        @ion-blur="touchedInputs.push('passwordConfirmation')"
      >
        <ion-icon
          style="float: right"
          :ios="showPasswordConfirmation ? eyeOffOutline : eyeOutline"
          :md="showPasswordConfirmation ? eyeOffSharp : eyeSharp"
          @click="showPasswordConfirmation = !showPassword"
        />
      </ion-input>
      <ion-button @click="submitSignup">
        {{ t("Terminer l'inscription") }}
      </ion-button>
      <ion-button @click="cancelSignup">
        {{ t('Annuler') }}
      </ion-button>
    </ion-content></ion-page
  >
</template>

<script lang="ts" setup>
import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';

import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { token } = storeToRefs(app());

const collectionStore = wtdcollection();

const { t } = useI18n();

const router = useRouter();

const { validInputs, invalidInputs, touchedInputs, errorTexts, showError, clearErrors } = useFormErrorHandling([
  'username',
  'email',
  'password',
  'passwordConfirmation',
]);

const username = ref('' as string);
const email = ref('' as string);
const password = ref('' as string);
const passwordConfirmation = ref('' as string);

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const cancelSignup = () => {
  router.push('/');
};

const submitSignup = async () => {
  if (password.value !== passwordConfirmation.value) {
    errorTexts.value.passwordConfirmation = t('Les deux mots de passe doivent être identiques');
    return;
  }
  clearErrors();
  await collectionStore.signup(
    username.value,
    password.value,
    password.value,
    email.value,
    (newToken: string) => {
      token.value = newToken;
    },
    (e) => {
      showError(e);
    },
  );
};
</script>
<style lang="scss" scoped>
ion-input {
  ion-icon {
    margin-top: 1rem;
  }
}
</style>