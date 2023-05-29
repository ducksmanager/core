<template>
  <ion-page>
    <ion-header>
      <ion-title>{{ t('reset_password_description') }}</ion-title></ion-header
    >
    <ion-content>
      <ion-item>
        <ion-input
          :class="{
            disabled: showConfirmation,
            'ion-valid': validInputs.includes('email'),
            'ion-invalid': invalidInputs.includes('email'),
            'ion-touched': touchedInputs.includes('email'),
          }"
          type="email"
          v-model="email"
          :aria-label="t('email_address')"
          :placeholder="t('email_address')"
          @ionBlur="touchedInputs.push('email')"
        ></ion-input
      ></ion-item>
      <ion-item>
        <ion-button :disabled="showConfirmation" @click="submitForgot">{{ t('send') }}</ion-button> </ion-item
      ><ion-item v-if="showConfirmation">{{ t('reset_password_confirmation') }}</ion-item></ion-content
    >
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { POST__auth__forgot } from 'ducksmanager/types/routes';
import { call } from '~/axios-helper';
import axios from 'axios';

const { t } = useI18n();
defineProps<{
  filteredItems: { text: string }[];
}>();

const validInputs = ref([] as string[]);
const invalidInputs = ref([] as string[]);
const touchedInputs = ref([] as string[]);

const email = ref('' as string);
const showConfirmation = ref(false);

const submitForgot = async () => {
  await call(axios, new POST__auth__forgot({ reqBody: { email: email.value } }));
  showConfirmation.value = true;
};
</script>
