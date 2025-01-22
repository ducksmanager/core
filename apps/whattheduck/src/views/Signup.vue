<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-padding-start">{{ $t('Inscription') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-input
        v-model="username"
        :class="{
          'ion-valid': validInputs.includes('username'),
          'ion-invalid': invalidInputs.includes('username'),
          'ion-touched': touchedInputs.includes('username'),
        }"
        :error-text="errorTexts.username"
        :aria-label="$t('Nom d\'utilisateur DucksManager')"
        :placeholder="$t('Nom d\'utilisateur DucksManager')"
        @ion-blur="touchedInputs.push('username')"
      />
      <ion-input
        v-model="email"
        :class="{
          'ion-valid': validInputs.includes('email'),
          'ion-invalid': invalidInputs.includes('email'),
          'ion-touched': touchedInputs.includes('email'),
        }"
        :error-text="errorTexts.email"
        :aria-label="$t('Adresse e-mail')"
        :placeholder="$t('Adresse e-mail')"
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
        :error-text="errorTexts.password"
        :aria-label="$t('Mot de passe')"
        :placeholder="$t('Mot de passe')"
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
        :aria-label="$t('Confirmation mot de passe')"
        :placeholder="$t('Confirmation mot de passe')"
        @ion-blur="touchedInputs.push('passwordConfirmation')"
      >
        <ion-icon
          style="float: right"
          :ios="showPasswordConfirmation ? eyeOffOutline : eyeOutline"
          :md="showPasswordConfirmation ? eyeOffSharp : eyeSharp"
          @click="showPasswordConfirmation = !showPasswordConfirmation"
        />
      </ion-input>
      <ion-row class="ion-padding-top">
        <ion-button @click="submitSignup">
          {{ $t('OK') }}
        </ion-button>
        <ion-button color="light" @click="cancelSignup">
          {{ $t('Annuler') }}
        </ion-button></ion-row
      >
    </ion-content></ion-page
  >
</template>

<script lang="ts" setup>
import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';

import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { app } from '~/stores/app';

const { token, socket } = storeToRefs(app());

const { t } = useI18n();
const router = useRouter();

const { validInputs, invalidInputs, touchedInputs, errorTexts, clearErrors, submit } = useFormErrorHandling([
  'username',
  'email',
  'password',
  'passwordConfirmation',
]);

const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

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

  await submit(
    () =>
      socket.value!.auth.signup({
        username: username.value,
        password: password.value,
        email: email.value,
      }),
    (response) => {
      token.value = response;
    },
  );
};

watch(
  token,
  () => {
    if (token.value) {
      router.push('/collection#all=all');
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
ion-row {
  justify-content: space-between;
  ion-button {
    width: 40%;
  }
}
ion-input {
  ion-icon {
    margin-top: 1rem;
  }
}
</style>
