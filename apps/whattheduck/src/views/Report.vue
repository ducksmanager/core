<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Signaler un problème') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-text>{{
        t(
          "Quelque chose ne fonctionne pas sur l'application ?\nDétaillez votre problème et nous essaierons de le résoudre dans une prochaine version :-)",
        )
      }}</ion-text>
      <ion-textarea
        v-model="reportMessage"
        :rows="3"
        :class="{
          'ion-valid': validInputs.includes('reportMessage'),
          'ion-invalid': invalidInputs.includes('reportMessage'),
          'ion-touched': touchedInputs.includes('reportMessage'),
        }"
        :placeholder="t('Qu\'est-ce qui ne va pas ?')"
        @ionBlur="touchedInputs.push('reportMessage')"
      />
      <ion-button :disabled="showConfirmation" @click="submitReport">
        {{ t('Envoyer') }}
      </ion-button>
      <ion-item v-if="showConfirmation">
        {{ t('Merci pour votre retour !') }}
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
