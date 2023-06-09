<template>
  <ion-page v-if="showForm">
    <ion-header>
      <ion-title>{{ t('signup') }}</ion-title></ion-header
    >
    <ion-content>
      <ion-item v-if="isOfflineMode">
        <ion-label>{{ t('error__cannot_login') }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-input
          :class="{
            'ion-valid': validInputs.includes('username'),
            'ion-invalid': invalidInputs.includes('username'),
            'ion-touched': touchedInputs.includes('username'),
          }"
          v-model="username"
          :aria-label="t('username')"
          :placeholder="t('username')"
          @ionBlur="touchedInputs.push('username')"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-input
          :class="{
            'ion-valid': validInputs.includes('email'),
            'ion-invalid': invalidInputs.includes('email'),
            'ion-touched': touchedInputs.includes('email'),
          }"
          v-model="email"
          :aria-label="t('email_address')"
          :placeholder="t('email_address')"
          @ionBlur="touchedInputs.push('email')"
        ></ion-input>
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
          :error-text="t('error__cannot_login')"
          :aria-label="t('password')"
          :placeholder="t('password')"
          @ionBlur="touchedInputs.push('password')"
        >
          <ion-icon
            :ios="showPassword ? eyeOffOutline : eyeOutline"
            :md="showPassword ? eyeOffSharp : eyeSharp"
            @click="showPassword = !showPassword"
          ></ion-icon>
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
          :aria-label="t('password_confirm')"
          :placeholder="t('password_confirm')"
          @ionBlur="touchedInputs.push('passwordConfirmation')"
        >
          <ion-icon
            :ios="showPasswordConfirmation ? eyeOffOutline : eyeOutline"
            :md="showPasswordConfirmation ? eyeOffSharp : eyeSharp"
            @click="showPasswordConfirmation = !showPassword"
          ></ion-icon>
        </ion-input>
      </ion-item>
      <ion-item>
        <ion-button @click="submitSignup">{{ t('signup_end') }}</ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="cancelSignup">{{ t('cancel') }}</ion-button>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { PUT__collection__user } from '~dm_types/routes';
import { ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';
import { call } from '~/axios-helper';
import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { useRouter } from 'vue-router';
import { app } from '~/stores/app';
import { api } from '~/stores/api';
import { User } from '~/persistence/models/dm/User';

import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';
import { AxiosError } from 'axios';

const isOfflineMode = ref(false);

const appStore = app();

const apiStore = api();

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
  try {
    if (password.value !== passwordConfirmation.value) {
      errorTexts.value.passwordConfirmation = t('error_the_two_passwords_must_be_identical');
      return;
    }
    clearErrors();
    token.value = (
      await call(
        apiStore.dmApi,
        new PUT__collection__user({
          reqBody: { username: username.value, password: password.value, email: email.value },
        })
      )
    ).data?.token;
  } catch (e) {
    showError(e as AxiosError);
  }
};

watch(
  () => token.value,
  async () => {
    if (token.value) {
      await appStore.dbInstance.getRepository(User).save({ username: username.value, token: token.value });
      router.push('/collection');
    }
  },
  { immediate: true }
);
</script>
