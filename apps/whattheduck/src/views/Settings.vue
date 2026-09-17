<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ $t('Paramètres') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list class="ion-no-padding">
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ $t('Apparence') }}</ion-label>
          </ion-item-divider>
        </ion-item-group>
        <ion-segment :value="themePreference" @ion-change="onThemeChange">
          <ion-segment-button value="system">
            <ion-label>{{ $t('Système') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="light">
            <ion-label>{{ $t('Clair') }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="dark">
            <ion-label>{{ $t('Sombre') }}</ion-label>
          </ion-segment-button>
        </ion-segment>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ $t('Fonctionnalités') }}</ion-label>
          </ion-item-divider>
        </ion-item-group>
        <ion-row>
          <ion-col size="10" class="ion-padding"> <ion-label>Fast cover search (experimental)</ion-label></ion-col>
          <ion-col size="2" style="display: flex" class="ion-padding ion-justify-content-end"
            ><ion-checkbox v-model="isFastCoverSearchEnabled" /></ion-col
        ></ion-row>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ $t('Version') }}</ion-label>
          </ion-item-divider>
        </ion-item-group>
        <ion-item>
          <ion-label v-if="currentAppVersion">
            {{
              $t('What The Duck version {version} bundle {bundle}', {
                version: currentAppVersion,
                bundle: currentBundleVersion,
              })
            }}</ion-label
          ></ion-item
        >
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ $t('Réseaux sociaux') }}</ion-label>
          </ion-item-divider>
        </ion-item-group>
        <ion-item :detail="false" :href="discordUrl">
          <img src="/icons/discord.png" /><ion-text class="ion-padding-start">Discord</ion-text>
        </ion-item>
        <ion-item :detail="false" :href="facebookUrl">
          <img src="/icons/facebook.png" /><ion-text class="ion-padding-start">Facebook</ion-text>
        </ion-item>
        <ion-item :detail="false" :href="instagramUrl">
          <img src="/icons/instagram.png" /><ion-text class="ion-padding-start">Instagram</ion-text>
        </ion-item>
        <ion-item :detail="false" :href="youtubeUrl">
          <img src="/icons/youtube.png" /><ion-text class="ion-padding-start">YouTube</ion-text>
        </ion-item>
      </ion-list>
      <template v-if="!isOfflineMode">
        <ion-item-group style="padding-top: 1rem">
          <ion-item-divider>
            <ion-label>{{ $t('Compte') }}</ion-label>
          </ion-item-divider>
        </ion-item-group>
        <ion-button fill="outline" color="danger" style="display: flex" @click="deleteAccount">
          {{ $t('Supprimer mon compte') }}
        </ion-button>
      </template>
      <a id="link-to-dm" target="_blank" :href="storeUrl" class="ion-padding">
        <template v-if="storeName === 'Play Store'">{{
          $t("Notez What The Duck sur le Play Store si vous l'appréciez :-)")
        }}</template>
        <template v-else>{{ $t("Notez What The Duck sur l'App Store si vous l'appréciez :-)") }}</template>
      </a>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { Capacitor } from '@capacitor/core';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';

import { app } from '~/stores/app';
import { useTheme, type ThemePreference } from '~/composables/useTheme';

const { t } = useI18n();

const { preference: themePreference, setThemePreference } = useTheme();
const onThemeChange = (event: CustomEvent) => setThemePreference(event.detail.value as ThemePreference);
const playStoreUrl = 'https://play.google.com/store/apps/details?id=net.ducksmanager.whattheduck';
const appStoreUrl = 'https://www.apple.com/app-store/';
const discordUrl = import.meta.env.VITE_DISCORD_URL;
const facebookUrl = import.meta.env.VITE_FACEBOOK_URL;
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL;
const youtubeUrl = import.meta.env.VITE_YOUTUBE_URL;

const currentAppVersion = ref<string>();
const currentBundleVersion = ref<string>();
const storeName = ref<'App Store' | 'Play Store'>();

const storeUrl = computed(() => (storeName.value === 'Play Store' ? playStoreUrl : appStoreUrl));

const { socket, token, isOfflineMode, isFastCoverSearchEnabled } = storeToRefs(app());
const router = useRouter();

AppUpdate.getAppUpdateInfo()
  .then(async (result) => {
    currentAppVersion.value = result.currentVersionName;
    if (Capacitor.getPlatform() === 'android') {
      storeName.value = 'Play Store';
    } else {
      storeName.value = 'App Store';
    }
    currentBundleVersion.value = (await CapacitorUpdater.current())?.bundle.version;
  })
  .catch(() => {
    storeName.value = 'Play Store';
    currentAppVersion.value = 'web';
  });

const deleteAccount = async () => {
  if (confirm(t('Êtes-vous sûr(e) de vouloir supprimer votre compte ?'))) {
    await socket.value!.collection.deleteUser();
    token.value = null;
    await router.replace('/');
  }
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
  display: flex;
  align-items: center;
}
</style>
