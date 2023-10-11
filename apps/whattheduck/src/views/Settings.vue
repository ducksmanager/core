<template>
  <ion-page>
    <ion-header>
      <ion-title>{{ t('Paramètres') }}</ion-title>
    </ion-header>
    <ion-content>
      <ion-item>{{ t('What The Duck version %1$s', { version: '1.0.0' }) }}</ion-item>
      <ion-item class="flex">
        <ion-item>
          <a :href="discordUrl"><img src="/icons/discord.png" /></a>
        </ion-item>
        <ion-item>
          <a :href="facebookUrl"><img src="/icons/facebook.png" /></a>
        </ion-item>
        <ion-item>
          <a :href="instagramUrl"><img src="/icons/instagram.png" /></a>
        </ion-item>
        <ion-item>
          <a :href="youtubeUrl"><img src="/icons/youtube.png" /></a>
        </ion-item>
      </ion-item>
      <ion-item style="border-bottom: 1px solid white">
        {{ t('Notez What The Duck sur le Play Store :-)') }}
      </ion-item>
      <ion-item>{{ t('Me suggérer des magazines des pays suivants :') }}</ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
const { t } = useI18n();

const discordUrl = import.meta.env.VITE_DISCORD_URL;
const facebookUrl = import.meta.env.VITE_FACEBOOK_URL;
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL;
const youtubeUrl = import.meta.env.VITE_YOUTUBE_URL;

(async () => {})();
</script>
