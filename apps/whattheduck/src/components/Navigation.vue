<template>
  <ion-segment v-if="parts" :value="appStore.currentNavigationItem" @ionChange="onChange">
    <ion-segment-button :key="key" v-for="{ key, text } in parts" :value="key">
      <ion-label>{{ text }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { computed } from 'vue';
import { app } from '../stores/app.js';
import { coa } from '../stores/coa.js';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();

const appStore = app();
const coaStore = coa();

const { t } = useI18n();

// eslint-disable-next-line no-undef
const parts = computed(() => {
  if (!coaStore.countryNames) {
    return [];
  }
  const parts: { key: string; text: string }[] | undefined = [
    {
      key: '',
      text: t('all_countries'),
    },
  ];
  if (appStore.currentNavigationItem) {
    const publicationParts = appStore.currentNavigationItem.split('/');
    parts.push({
      key: publicationParts[0],
      text: coaStore.countryNames?.[publicationParts[0]] || publicationParts[0],
    });
    if (publicationParts.length === 2) {
      parts.push({
        key: appStore.currentNavigationItem,
        text: coaStore.publicationNames[appStore.currentNavigationItem]!,
      });
    }
  }
  return parts;
});

const onChange = (event: any) => {
  router.replace(event.detail.value ? `/collection/${event.detail.value}` : '/collection');
};

(async () => {
  await coaStore.fetchCountryNames();
})();
</script>

<style lang="scss" scoped>
ion-segment {
  justify-content: start;
  height: 48px;
  background-color: var(--ion-background-color);
}

ion-segment-button {
  width: 33.333%;
  max-width: 33.333%;
  align-items: center;
  text-transform: none;

  ion-label {
    width: 100%;
    white-space: normal;
    overflow-y: auto;
  }

  &::part(native) {
    padding: 0;
    max-width: 100%;
  }
}
</style>
