<template>
  <ion-page>>
    <ion-header>
      <ion-title>{{ t('Indiquez votre addresse e-mail pour réinitialiser votre mot de passe') }}</ion-title>
    </ion-header>
    <ion-content>
      <ion-item>
        <ion-input
          v-model="email"
          :class="{
            disabled: showConfirmation,
            'ion-valid': validInputs.includes('email'),
            'ion-invalid': invalidInputs.includes('email'),
            'ion-touched': touchedInputs.includes('email'),
          }"
          type="email"
          :aria-label="t('Adresse e-mail')"
          :placeholder="t('Adresse e-mail')"
          @ionBlur="touchedInputs.push('email')"
        />
      </ion-item>
      <ion-item>
        <ion-button :disabled="showConfirmation" @click="submitForgot">
          {{ t('Envoyer') }}
        </ion-button> </ion-item
      ><ion-item v-if="showConfirmation">
        {{
          t(
            "Si l'adresse e-mail entrée correspond à un compte DucksManager, nous venons d'y envoyer un lien permettant la réinitialisation du mot de passe. Si l'e-mail ne vous parvient pas d'ici quelques minutes, veuillez vérifier votre dossier Spam.",
          )
        }}
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { authServices } from '~web/src/composables/useDmSocket';

const { t } = useI18n();

const validInputs = ref([] as string[]);
const invalidInputs = ref([] as string[]);
const touchedInputs = ref([] as string[]);

const email = ref('' as string);
const showConfirmation = ref(false);

const submitForgot = async () => {
  await authServices.requestTokenForForgotPassword(email.value);
  showConfirmation.value = true;
};
</script>
