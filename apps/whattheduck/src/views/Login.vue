<template>
  <ion-page v-if="showForm">
    <ion-header>
      <ion-title>{{ t('Connexion') }}</ion-title>
    </ion-header>
    <ion-content>
      <ion-item v-if="isOfflineMode">
        <ion-label>{{
          t(
            'La connexion à votre compte DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
          )
        }}</ion-label>
      </ion-item>
      <ion-item>
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
      </ion-item>
      <ion-item>
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
              'La connexion à votre compte DucksManager a échoué, vérifiez que votre connexion Internet est active. Vous pourrez consulter votre collection hors-ligne une fois que votre collection sera synchronisée.',
            )
          "
          :aria-label="t('Mot de passe')"
          :placeholder="t('Mot de passe')"
          @ionBlur="touchedInputs.push('password')"
        />
        <ion-icon
          :ios="showPassword ? eyeOffOutline : eyeOutline"
          :md="showPassword ? eyeOffSharp : eyeSharp"
          @click="showPassword = !showPassword"
        />
      </ion-item>
      <ion-item>
        <ion-button @click="submitLogin">
          {{ t('Connexion') }}
        </ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="signup">
          {{ t('Inscription') }}
        </ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="forgotPassword">
          {{ t('Mot de passe oublié ?') }}
        </ion-button>
      </ion-item>

      <ion-item>
        <a :href="dmUrl">{{
          t(
            "What The Duck est l'application mobile de DucksManager. Cliquez ici pour accéder au site Web de DucksManager.",
          )
        }}</a>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { SplashScreen } from '@capacitor/splash-screen';
import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';
import { stores } from '~web';

import useFormErrorHandling from '~/composables/useFormErrorHandling';
import { InducksIssuequotation } from '~/persistence/models/coa/InducksIssuequotation';
import { User } from '~/persistence/models/dm/User';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const isOfflineMode = ref(false);

const appStore = app();
const collectionStore = wtdcollection();

const coaStore = stores.coa();

const dmUrl = import.meta.env.VITE_DM_URL as string;

const { t } = useI18n();

const router = useRouter();

const username = ref('' as string);
const password = ref('' as string);

const showForm = ref(false);

const showPassword = ref(false);

const token = ref(null as string | null);

const { validInputs, invalidInputs, touchedInputs, errorTexts, showError, clearErrors } = useFormErrorHandling([
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
  await collectionStore.login(
    username.value,
    password.value,
    (newToken) => {
      token.value = newToken;
    },
    (e) => {
      showError(e);
    },
  );
};

watch(
  () => token.value,
  async () => {
    if (token.value) {
      await appStore.dbInstance.getRepository(User).save({ username: username.value, token: token.value });
      router.push('/collection');
    }
  },
  { immediate: true },
);

watch(
  () => showForm.value,
  async (value) => {
    if (value) {
      await SplashScreen.hide();
    }
  },
);

watch(
  () => collectionStore.collection,
  async (value) => {
    if (value) {
      await collectionStore.loadPurchases();
    }
  },
  { immediate: true },
);

watch(
  () => collectionStore.ownedPublications,
  async (newValue) => {
    if (newValue) {
      await coaStore.fetchIssueQuotations(collectionStore.ownedPublications);
    }
  },
  { immediate: true },
);

watch(
  () => app().isOfflineMode,
  (isOfflineMode) => {
    if (isOfflineMode) {
      showForm.value = true;
    }
  },
);

(async () => {
  await SplashScreen.show({
    autoHide: true,
  });

  try {
    await collectionStore
      .fetchAndTrackCollection()
      .catch(() => {
        showForm.value = true;
      })
      .then(() => router.push('/collection'));
  } catch (e) {
    showForm.value = true;
  }
})();
</script>
