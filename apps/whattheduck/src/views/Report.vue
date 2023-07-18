<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ t('report') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-text>{{ t('report_description') }}</ion-text>
      <ion-textarea
        :rows="3"
        :class="{
          'ion-valid': validInputs.includes('reportMessage'),
          'ion-invalid': invalidInputs.includes('reportMessage'),
          'ion-touched': touchedInputs.includes('reportMessage'),
        }"
        placeholder="Qu'est-ce qui ne va pas ?"
        v-model="reportMessage"
        @ionBlur="touchedInputs.push('reportMessage')"
      ></ion-textarea>
      <ion-button :disabled="showConfirmation" @click="submitReport">{{ t('send') }}</ion-button>
      <ion-item v-if="showConfirmation">{{ t('thanks_report') }}</ion-item></ion-content
    >
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const validInputs = ref([] as string[]);
const invalidInputs = ref([] as string[]);
const touchedInputs = ref([] as string[]);

const reportMessage = ref('' as string);
const showConfirmation = ref(false);

const submitReport = async () => {
  // TODO call API
  showConfirmation.value = true;
};
</script>
