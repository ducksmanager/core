<template>
  <ion-page>
    <ion-header>
      <ion-title>{{ t('report') }}</ion-title></ion-header
    >
    <ion-content>
      <ion-item>{{ t('report_description') }}</ion-item>
      <ion-item>
        <ion-input
          :class="{
            'ion-valid': validInputs.includes('reportMessage'),
            'ion-invalid': invalidInputs.includes('reportMessage'),
            'ion-touched': touchedInputs.includes('reportMessage'),
          }"
          type="text"
          v-model="reportMessage"
          :aria-label="t('report_description')"
          :placeholder="t('report_description')"
          @ionBlur="touchedInputs.push('reportMessage')"
        ></ion-input
      ></ion-item>
      <ion-item>
        <ion-button :disabled="showConfirmation" @click="submitReport">{{ t('send') }}</ion-button> </ion-item
      ><ion-item v-if="showConfirmation">{{ t('thanks_report') }}</ion-item></ion-content
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
