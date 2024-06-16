<template>
  <ion-page v-show="token === null">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ t('Connexion') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-row>
        <ion-col>
          <ion-input
            v-model="username"
            :class="{
              'ion-valid': validInputs.includes('username'),
              'ion-invalid': invalidInputs.includes('username'),
              'ion-touched': touchedInputs.includes('username'),
            }"
            :aria-label="t('Nom d\'utilisateur DucksManager')"
            :placeholder="t('Nom d\'utilisateur DucksManager')"
            @ionBlur="touchedInputs.push('username')"
          />
        </ion-col>
      </ion-row>
      <ion-row class="ion-align-items-center">
        <ion-col size="11">
          <ion-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :class="{
              'ion-valid': validInputs.includes('password'),
              'ion-invalid': invalidInputs.includes('password'),
              'ion-touched': touchedInputs.includes('password'),
            }"
            :error-text="
              errorTexts.password ||
              t(
                'La connexion à DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
              )
            "
            :aria-label="t('Mot de passe')"
            :placeholder="t('Mot de passe')"
            @ionBlur="touchedInputs.push('password')"
          />
        </ion-col>
        <ion-col size="1">
          <ion-icon
            :ios="showPassword ? eyeOffOutline : eyeOutline"
            :md="showPassword ? eyeOffSharp : eyeSharp"
            @click="showPassword = !showPassword"
          /> </ion-col
      ></ion-row>
      <ion-row>
        <ion-col size="6">
          <ion-button @click="submitLogin" expand="block">
            {{ t('Connexion') }}
          </ion-button>
        </ion-col>

        <ion-col size="6">
          <ion-button @click="signup" expand="block">
            {{ t('Inscription') }}
          </ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="6" push="6" style="display: flex" class="flex ion-justify-content-end">
          <ion-button @click="forgotPassword" size="small">
            {{ t('Mot de passe oublié ?') }}
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
    <ion-footer>
      <ion-button id="link-to-dm" expand="full" color="medium" @click.prevent="() => {}">
        <a :href="dmUrl">{{
          t(
            "What The Duck est l'application mobile de DucksManager. Cliquez ici pour accéder au site Web de DucksManager.",
          )
        }}</a>
      </ion-button>
    </ion-footer></ion-page
  >
</template>

<script lang="ts" setup>
import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';

import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { app } from '~/stores/app';

const { token, socket } = storeToRefs(app());

const dmUrl = import.meta.env.VITE_DM_URL as string;

const { t } = useI18n();

const router = useRouter();

const username = ref('' as string);
const password = ref('' as string);

const showPassword = ref(false);

const { validInputs, invalidInputs, touchedInputs, errorTexts } = useFormErrorHandling(['username', 'password']);

const forgotPassword = () => {
  router.push('/forgot');
};
const signup = () => {
  router.push('/signup');
};

const submitLogin = async () => {
  const response = await socket.value?.login.services.login({
    username: username.value,
    password: password.value,
  });
  if (typeof response !== 'string' && response && 'error' in response) {
    errorTexts.value['password'] = response.error;
  } else {
    token.value = response;
  }
};

watch(
  token,
  () => {
    if (token.value) {
      window.location.replace('/collection');
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
#link-to-dm {
  margin: 0;
  a {
    text-transform: none;
    text-decoration: none;
    white-space: normal;
    color: white;
  }
}
</style>
