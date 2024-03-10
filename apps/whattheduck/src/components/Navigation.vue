<template>
  <ion-segment v-if="parts" :value="appStore.currentNavigationItem" @ionChange="onChange">
    <ion-segment-button v-for="{ key, text, component } in parts" :key="key" :value="key">
      <component v-if="component" :is="component" :key="key" :label="text" />
      <ion-label v-else>{{ text }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { app } from '~/stores/app.js';
import Country from './Country.vue';
import Publication from './Publication.vue';

const router = useRouter();

const appStore = app();
const coaStore = stores.coa();

const { t } = useI18n();

// eslint-disable-next-line no-undef
const parts = computed(() => {
  if (!coaStore.countryNames) {
    return [];
  }
  const parts: {key: string, text: string, component?: any}[] = [
    {
      key: '',
      text: t('Tous les pays'),
    },
  ];
  if (appStore.currentNavigationItem) {
    const publicationParts = appStore.currentNavigationItem.split('/');
    parts.push({
      component: Country,
      key: publicationParts[0],
      text: coaStore.countryNames?.[publicationParts[0]] || publicationParts[0],
    });
    if (publicationParts.length === 2) {
      parts.push({ 
      component: Publication,
        key: appStore.currentNavigationItem,
        text: coaStore.publicationNames[appStore.currentNavigationItem]!,
      });
    }
  }
  return parts;
});

const onChange = (event: any) => {
  router.push((event.detail.value ? `/collection/${event.detail.value}` : '/collection') + window.location.search);
};

(async () => {
  await coaStore.fetchCountryNames();
})();
</script>

<style lang="scss" scoped>
ion-segment {
  display: flex;
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
