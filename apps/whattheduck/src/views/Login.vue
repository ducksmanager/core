<template>
  <ion-page v-if="showForm">
    <ion-header>
      <ion-title>{{ t('login') }}</ion-title></ion-header
    >
    <ion-content>
      <ion-item v-if="isOfflineMode">
        <ion-label>{{ t('error__cannot_login') }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-input
          :class="{
            'ion-valid': validInputs.includes('username'),
            'ion-invalid': invalidInputs.includes('username'),
            'ion-touched': touchedInputs.includes('username'),
          }"
          v-model="username"
          :aria-label="t('username')"
          :placeholder="t('username')"
          @ionBlur="touchedInputs.push('username')"
        ></ion-input>
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
          :error-text="errorTexts.password || t('error__cannot_login')"
          :aria-label="t('password')"
          :placeholder="t('password')"
          @ionBlur="touchedInputs.push('password')"
        >
          <ion-icon
            :ios="showPassword ? eyeOffOutline : eyeOutline"
            :md="showPassword ? eyeOffSharp : eyeSharp"
            @click="showPassword = !showPassword"
          ></ion-icon>
        </ion-input>
      </ion-item>
      <ion-item>
        <ion-button @click="submitLogin">{{ t('login') }}</ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="signup">{{ t('signup') }}</ion-button>
      </ion-item>
      <ion-item>
        <ion-button @click="forgotPassword">{{ t('reset_password_title') }}</ion-button>
      </ion-item>

      <ion-item>
        <a :href="dmUrl">{{ t('link_to_ducksmanager_website') }}</a>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { SplashScreen } from '@capacitor/splash-screen';
import { IonItem, IonButton, IonContent, IonHeader, IonPage, IonInput, IonTitle, IonIcon } from '@ionic/vue';
import { POST__login } from '~dm_types/routes';
import { ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';
import { call } from '~/axios-helper';
import { useRouter } from 'vue-router';
import { app } from '~/stores/app';
import { api } from '~/stores/api';
import { User } from '~/persistence/models/dm/User';
import { Sync } from '~/persistence/models/internal/Sync';

import { collection } from '~/stores/collection';
import { AxiosError } from 'axios';
import { Issue } from '~/persistence/models/dm/Issue';
import { Purchase } from '~/persistence/models/dm/Purchase';
import { coa } from '~/stores/coa';
import { InducksIssuequotation } from '~/persistence/models/coa/InducksIssuequotation';

import { eyeOutline, eyeOffOutline, eyeSharp, eyeOffSharp } from 'ionicons/icons';
import { InducksIssueQuotationSimple } from 'ducksmanager/types/InducksIssueQuotationSimple';
import useFormErrorHandling from '~/composables/useFormErrorHandling';

const isOfflineMode = ref(false);

const appStore = app();

const appInstance = appStore.dbInstance!;
const apiStore = api();

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
  router.replace({ path: '/forgot' });
};
const signup = () => {
  router.replace({ path: '/signup' });
};

const submitLogin = async () => {
  try {
    clearErrors();
    token.value = (
      await call(
        apiStore.dmApi,
        new POST__login({
          reqBody: { username: username.value, password: password.value },
        })
      )
    ).data?.token;
  } catch (e) {
    showError(e as AxiosError);
  }
};

const isObsoleteSync = (latestSync: Sync | null) =>
  !latestSync || new Date().getTime() - latestSync.timestamp.getTime() > 12 * 60 * 60 * 1000;

watch(
  () => token.value,
  async () => {
    if (token.value) {
      await appStore.dbInstance!.getRepository(User).save({ username: username.value, token: token.value });
      router.replace({ path: '/collection' });
    }
  },
  { immediate: true }
);

watch(
  () => showForm.value,
  async (value) => {
    if (value) {
      await SplashScreen.hide();
    }
  }
);

const fetchCollection = async () => {
  const latestSync = await appInstance.getRepository(Sync).find();
  try {
    await collection().loadCollection();
    await appInstance.getRepository(Issue).clear();
    await appInstance.getRepository(Issue).save(collection().collection!);

    await collection().loadPurchases();
    await appInstance.getRepository(Purchase).clear();
    await appInstance.getRepository(Purchase).save(collection().purchases!);

    await coa().fetchIssueQuotations(collection().ownedPublications);
    appInstance.getRepository(InducksIssuequotation).clear();
    /*const issueQuotations = Object.entries(coa().issueQuotations!).reduce((acc, [issuecode, quotation]) => {
      const [publicationcode, issuenumber] = issuecode.split(/(?<=[^ ]+) /);
      return [...acc, { publicationcode, issuenumber, min: quotation.min, max: quotation.max }];
    }, [] as InducksIssuequotation[]);
    appInstance.getRepository(InducksIssuequotation).save(issueQuotations);*/

    await collection().loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false, sort: 'publicationcode' });
    await collection().loadSuggestions({ countryCode: 'ALL', sinceLastVisit: false, sort: 'releasedate' });

    // TODO retrieve user points
    // TODO retrieve user notification countries

    if (isObsoleteSync(latestSync?.[0])) {
      // TODO get app version
      await coa().fetchPublicationNames(['ALL']);
      await coa().fetchIssueCounts();
    }

    // TODO register for notifications

    router.replace({ path: '/collection' });
  } catch (e) {
    switch ((e as AxiosError).response?.status) {
      case 404:
        if (latestSync) {
          router.replace({ path: '/collection' });
        } else {
          isOfflineMode.value = true;
          showForm.value = true;
        }
        break;
      case 401: // Alert input_error__invalid_credentials
      default: // Alert error
    }
  }
};

await SplashScreen.show({
  autoHide: false,
});

(async () => {
  const user = await appInstance.getRepository(User).find();
  if (user.length) {
    await fetchCollection();
  } else {
    showForm.value = true;
  }
})();
</script>
