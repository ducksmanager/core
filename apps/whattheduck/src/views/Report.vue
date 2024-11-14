<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button color="primary" />
          </ion-buttons>
        </template>
        <ion-title>{{ t('Signaler un problème') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-text>{{
        t(
          "Quelque chose ne fonctionne pas sur l'application ?{br}Détaillez votre problème et nous essaierons de le résoudre dans une prochaine version :-)",
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
        @ion-blur="touchedInputs.push('reportMessage')"
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
const validInputs = ref<string[]>([]);
const invalidInputs = ref<string[]>([]);
const touchedInputs = ref<string[]>([]);

const reportMessage = ref('');
const showConfirmation = ref(false);

const submitReport = async () => {
  // TODO call API
  showConfirmation.value = true;
};
</script>
