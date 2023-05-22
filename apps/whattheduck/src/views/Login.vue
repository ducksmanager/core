<template>
  <ion-page>
    <ion-header>
      <ion-title>{{ t('login') }}</ion-title></ion-header
    >
    <ion-content>
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
          v-model="password"
          type="password"
          :class="{
            'ion-valid': validInputs.includes('password'),
            'ion-invalid': invalidInputs.includes('password'),
            'ion-touched': touchedInputs.includes('password'),
          }"
          :error-text="t('error__cannot_login')"
          :aria-label="t('password')"
          :placeholder="t('password')"
          @ionBlur="touchedInputs.push('password')"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-button @click="submitLogin">{{ t('login') }}</ion-button>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

import { IonItem, IonButton, IonContent, IonHeader, IonPage, IonInput, IonTitle } from '@ionic/vue';
import { POST__login } from '~dm_types/routes';
import { ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';
import { call } from '~/axios-helper';
import { useRouter } from 'vue-router';

const { t } = useI18n();

const router = useRouter();

const validInputs = ref([] as string[]);
const invalidInputs = ref([] as string[]);
const touchedInputs = ref([] as string[]);

const username = ref('' as string);
const password = ref('' as string);

const token = ref(null as string | null);

const submitLogin = async () => {
  try {
    validInputs.value = ['password'];
    invalidInputs.value = [];
    token.value = (
      await call(
        axios,
        new POST__login({
          reqBody: { username: username.value, password: password.value },
        })
      )
    ).data.token;
    await Preferences.set({
      key: 'token',
      value: token.value,
    });
  } catch (_e) {
    invalidInputs.value = ['password'];
    validInputs.value = [];
  }
};

watch(
  () => token.value,
  () => {
    if (token.value) {
      router.replace({ path: '/collection' });
    }
  },
  { immediate: true }
);
</script>
