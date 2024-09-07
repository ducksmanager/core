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
        <b>{{ t('What The Duck version {version}', { version: currentAppVersion }) }}</b>
      </div>
      <div>
        <a :href="discordUrl"><img src="/icons/discord.png" /></a>
        <a :href="facebookUrl"><img src="/icons/facebook.png" /></a>
        <a :href="dmUrl"><img src="/icons/ducksmanager.png" /></a>
        <a :href="instagramUrl"><img src="/icons/instagram.png" /></a>
        <a :href="youtubeUrl"><img src="/icons/youtube.png" /></a>
      </div>
      <ion-button id="link-to-dm" :href="playStoreUrl">
        {{ t("Notez What The Duck sur le Play Store si vous appréciez l'utiliser :-)") }}
      </ion-button>
    </ion-content></ion-page
  >
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { AppUpdate } from '@capawesome/capacitor-app-update';

const { t } = useI18n();

const dmUrl = 'https://ducksmanager.net';
const playStoreUrl = 'https://play.google.com/store/apps/details?id=net.ducksmanager.whattheduck';

const currentAppVersion = ref<string | null>(null);

AppUpdate.getAppUpdateInfo()
  .then((result) => {
    if (Capacitor.getPlatform() === 'android') {
      currentAppVersion.value = result.currentVersionCode;
    } else {
      currentAppVersion.value = result.currentVersionName;
    }
  })
  .catch(() => {
    currentAppVersion.value = 'web';
  });

const discordUrl = import.meta.env.VITE_DISCORD_URL;
const facebookUrl = import.meta.env.VITE_FACEBOOK_URL;
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
