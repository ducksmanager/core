<template>
  <ion-page v-show="token === null">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title class="ion-padding-start">{{ $t('Connexion') }}</ion-title>
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
            :aria-label="$t('Nom d\'utilisateur DucksManager')"
            :placeholder="$t('Nom d\'utilisateur DucksManager')"
            :error-text="errorTexts.username"
            @ion-blur="touchedInputs.push('username')"
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
            :error-text="errorTexts.password || $t('Erreur')"
            :aria-label="$t('Mot de passe')"
            :placeholder="$t('Mot de passe')"
            @ion-blur="touchedInputs.push('password')"
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
          <ion-button expand="block" :disabled="isOffline" @click="submitLogin">
            {{ $t('Connexion') }}
          </ion-button>
        </ion-col>

        <ion-col size="6">
          <ion-button expand="block" :disabled="isOffline" @click="signup">
            {{ $t('Inscription') }}
          </ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="6" push="6" class="flex ion-justify-content-end">
          <ion-button size="small" :disabled="isOffline" @click="forgotPassword">
            {{ $t('Mot de passe oublié ?') }}
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
    <ion-footer>
      <ion-button id="link-to-dm" expand="full" color="medium" @click.prevent="() => {}">
        <a :href="dmUrl">{{
          $t(
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

const { token, socket, isOffline } = storeToRefs(app());

const dmUrl = import.meta.env.VITE_DM_URL as string;

const router = useRouter();

const username = ref('');
const password = ref('');

const showPassword = ref(false);

const { validInputs, invalidInputs, touchedInputs, errorTexts, submit } = useFormErrorHandling([
  'username',
  'password',
]);

const forgotPassword = () => {
  router.push('/forgot');
};
const signup = () => {
  router.push('/signup');
};

const submitLogin = async () => {
  await submit(
    () =>
      socket.value!.auth.events.login({
        username: username.value,
        password: password.value,
      }),
    (response) => {
      token.value = response;
    },
  );
};

if (!token.value) {
  injectLocal<Storage>('storage')!.clear();
}

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
