<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-padding-start">{{ t('Inscription') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <errorable-input
        v-for="(field, name) of fields"
        :key="fields[name].label"
        v-model="fields[name]"
        :type="
          (name === 'password' && !showPassword) || (name === 'passwordConfirmation' && !showPasswordConfirmation)
            ? 'password'
            : 'text'
        "
        :label="field.label"
      >
        <ion-icon
          v-if="name === 'password' || name === 'passwordConfirmation'"
          style="float: right"
          :ios="showPassword ? eyeOffOutline : eyeOutline"
          :md="showPassword ? eyeOffSharp : eyeSharp"
          @click="showPassword = !showPassword"
        />
      </errorable-input>
      <ion-row class="ion-padding-top">
        <ion-button @click="submitSignup">
          {{ t('OK') }}
        </ion-button>
        <ion-button color="light" @click="cancelSignup">
          {{ t('Annuler') }}
        </ion-button></ion-row
      >
    </ion-content></ion-page
  >
</template>

<script lang="ts" setup>
import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';

import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { app } from '~/stores/app';

const { token, socket } = storeToRefs(app());

const { t } = useI18n();

const router = useRouter();

const fields = useFormErrorHandling({
  username: t("Nom d'utilisateur DucksManager"),
  password: t('Mot de passe'),
  passwordConfirmation: t('Confirmation mot de passe'),
  email: t('Adresse e-mail'),
});

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const cancelSignup = () => {
  router.push('/');
};

const submitSignup = async () => {
  const response = await socket.value?.auth.services.signup({
    username: fields.username.value,
    password: fields.password.value,
    passwordConfirmation: fields.passwordConfirmation.value,
    email: fields.email.value,
  });

  if (typeof response !== 'string' && response && 'error' in response) {
    fields[response.error.name].errorText = response.error.message;
  } else {
    token.value = response;
  }
};

watch(
  token,
  () => {
    if (token.value) {
      router.push('/collection#all=all');
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
ion-row {
  justify-content: space-between;
  ion-button {
    width: 40%;
  }
}
ion-input {
  ion-icon {
    margin-top: 1rem;
  }
}
</style>
