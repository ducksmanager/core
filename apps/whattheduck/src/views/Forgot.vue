<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title class="ion-no-padding">{{ $t('Mot de passe oublié ?') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-text>
        {{ $t('Indiquez votre addresse e-mail pour réinitialiser votre mot de passe') }}
      </ion-text>
      <ion-input
        v-model="email"
        class="ion-margin-top"
        :class="{
          disabled: showConfirmation,
          'ion-valid': validInputs.includes('email'),
          'ion-invalid': invalidInputs.includes('email'),
          'ion-touched': touchedInputs.includes('email'),
        }"
        type="email"
        :aria-label="$t('Adresse e-mail')"
        :placeholder="$t('Adresse e-mail')"
        @ion-blur="touchedInputs.push('email')"
      />
      <ion-button :disabled="showConfirmation" @click="submitForgot">
        {{ $t('Envoyer') }}
      </ion-button>
      <br />
      <ion-label v-if="showConfirmation" color="medium" class="ion-padding-top">
        {{
          $t(
            "Si l'adresse e-mail entrée correspond à un compte DucksManager, nous venons d'y envoyer un lien permettant la réinitialisation du mot de passe. Si l'e-mail ne vous parvient pas d'ici quelques minutes, veuillez vérifier votre dossier Spam.",
          )
        }}
      </ion-label>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { app } from '~/stores/app';

const { socket } = storeToRefs(app());
const { auth: authEvents } = socket.value!;

const validInputs = ref<string[]>([]);
const invalidInputs = ref<string[]>([]);
const touchedInputs = ref<string[]>([]);

const email = ref('');
const showConfirmation = ref(false);

const submitForgot = async () => {
  await authEvents.requestTokenForForgotPassword(email.value);
  showConfirmation.value = true;
};
</script>
