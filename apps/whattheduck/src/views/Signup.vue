<template>
  <ion-page v-if="showForm">
    <ion-header>
      <ion-title>{{ t('Inscription') }}</ion-title>
    </ion-header>
    <ion-content>
      <ion-item v-if="isOfflineMode">
        <ion-label>{{
          t(
            'La connexion à votre compte DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
          )
        }}</ion-label>
      </ion-item>
      <ion-item>
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
      </ion-item>
      <ion-item>
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
      </ion-item>
      <ion-item>
        <ion-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :class="{
            'ion-valid': validInputs.includes('password'),
            'ion-invalid': invalidInputs.includes('password'),
            'ion-touched': touchedInputs.includes('password'),
          }"
          :error-text="
            t(
              'La connexion à votre compte DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
            )
          "
          :aria-label="t('Mot de passe')"
          :placeholder="t('Mot de passe')"
          @ion-blur="touchedInputs.push('password')"
        >
          <ion-icon
            :ios="showPassword ? eyeOffOutline : eyeOutline"
            :md="showPassword ? eyeOffSharp : eyeSharp"
            @click="showPassword = !showPassword"
          />
        </ion-input>
      </ion-item>
      <ion-item>
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
            :ios="showPasswordConfirmation ? eyeOffOutline : eyeOutline"
            :md="showPasswordConfirmation ? eyeOffSharp : eyeSharp"
            @click="showPasswordConfirmation = !showPassword"
          />
        </ion-input>
      </ion-item>
      <ion-item>
        <ion-button @click="submitSignup">
          {{ t("Terminer l'inscription") }}
        </ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="cancelSignup">
          {{ t('Annuler') }}
        </ion-button>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';

import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { User } from '~/persistence/models/dm/User';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const isOfflineMode = ref(false);

const appStore = app();

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

const showForm = ref(false);

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const token = ref(null as string | null);

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
    (newToken) => {
      token.value = newToken;
    },
    (e) => {
      showError(e);
    },
  );
};

watch(
  () => token.value,
  async () => {
    if (token.value) {
      await appStore.dbInstance.getRepository(User).save({ username: username.value, token: token.value });
      router.push('/collection');
    }
  },
  { immediate: true },
);
</script>
