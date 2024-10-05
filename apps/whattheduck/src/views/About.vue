<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('A propos') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="currentAppVersion">
      <div>
        <b>{{
          t('What The Duck version {version} bundle {bundle}', {
            version: currentAppVersion,
            bundle: currentBundleVersion,
          })
        }}</b>
      </div>
      <div>
        <router-link :to="discordUrl"><img src="/icons/discord.png" /></router-link>
        <router-link :to="facebookUrl"><img src="/icons/facebook.png" /></router-link>
        <router-link :to="dmUrl"><img src="/icons/ducksmanager.png" /></router-link>
        <router-link :to="instagramUrl"><img src="/icons/instagram.png" /></router-link>
        <router-link :to="youtubeUrl"><img src="/icons/youtube.png" /></router-link>
      </div>
      <ion-button id="link-to-dm" :href="playStoreUrl">
        {{ t("Notez What The Duck sur le {store} si vous l'appréciez :-)") }}
      </ion-button>
    </ion-content></ion-page
  >
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const { t } = useI18n();

const playStoreUrl = 'https://play.google.com/store/apps/details?id=net.ducksmanager.whattheduck';

const currentAppVersion = ref<string | null>(null);
const currentBundleVersion = ref<string | null>(null);
const storeName = ref<string | null>(null);

AppUpdate.getAppUpdateInfo()
  .then(async (result) => {
    if (Capacitor.getPlatform() === 'android') {
      currentAppVersion.value = result.currentVersionCode;
      storeName.value = 'Play Store';
    } else {
      currentAppVersion.value = result.currentVersionName;
      storeName.value = 'App Store';
    }
    currentBundleVersion.value = (await CapacitorUpdater.current())?.bundle.version;
  })
  .catch(() => {
    storeName.value = 'Play Store';
    currentAppVersion.value = 'web';
  });

const discordUrl = import.meta.env.VITE_DISCORD_URL;
const facebookUrl = import.meta.env.VITE_FACEBOOK_URL;
const dmUrl = import.meta.env.VITE_DM_URL;
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL;
const youtubeUrl = import.meta.env.VITE_YOUTUBE_URL;
</script>

<style lang="scss" scoped>
ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

ion-content > div {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  line-height: 1rem;
}
</style>
