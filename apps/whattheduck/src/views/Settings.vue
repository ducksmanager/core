<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button color="primary" />
          </ion-buttons>
        </template>
        <ion-title>{{ t('Paramètres') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>{{ t('Version') }}</ion-label>
          </ion-item-divider>
        </ion-item-group>
        <ion-item>
          <ion-text v-if="currentAppVersion">
            {{
              t('What The Duck version {version} bundle {bundle}', {
                version: currentAppVersion,
                bundle: currentBundleVersion,
              })
            }}</ion-text
          ></ion-item
        >
        <router-link id="link-to-dm" class="ion-padding" :to="storeUrl">
          <template v-if="storeName === 'Play Store'">{{
            t("Notez What The Duck sur le Play Store si vous l'appréciez :-)")
          }}</template>
          <template v-else>{{ t("Notez What The Duck sur l'App Store si vous l'appréciez :-)") }}</template>
        </router-link>
        <ion-item-group style="padding-top: 1rem">
          <ion-item-divider>
            <ion-label>{{ t('Réseaux sociaux') }}</ion-label>
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
      <ion-item-group style="padding-top: 1rem">
        <ion-item-divider>
          <ion-label>{{ t('Compte') }}</ion-label>
        </ion-item-divider>
      </ion-item-group>
      <ion-button fill="outline" color="danger" style="display: flex" @click="deleteAccount">
        {{ t('Supprimer mon compte') }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { Capacitor } from '@capacitor/core';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';

import { app } from '~/stores/app';

const playStoreUrl = 'https://play.google.com/store/apps/details?id=net.ducksmanager.whattheduck';
const appStoreUrl = 'https://www.apple.com/app-store/';
const discordUrl = import.meta.env.VITE_DISCORD_URL;
const facebookUrl = import.meta.env.VITE_FACEBOOK_URL;
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL;
const youtubeUrl = import.meta.env.VITE_YOUTUBE_URL;

const { t } = useI18n();

const currentAppVersion = ref<string | null>(null);
const currentBundleVersion = ref<string | null>(null);
const storeName = ref<'App Store' | 'Play Store' | null>(null);

const storeUrl = computed(() => (storeName.value === 'Play Store' ? playStoreUrl : appStoreUrl));

const { socket, token } = storeToRefs(app());
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
    await socket.value!.collection.services.deleteUser();
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
