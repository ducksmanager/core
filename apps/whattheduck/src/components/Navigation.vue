<template>
  <ion-segment v-if="parts" v-model="currentNavigationItem" @ionChange="onChange">
    <ion-segment-button v-for="{ id, text, component } in parts" :id="id" :value="id">
      <component v-if="component" :is="component" :id="id" :label="text" />
      <ion-label v-else>{{ text }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup lang="ts">
import { stores } from '~web';

import Country from './Country.vue';
import Publication from './Publication.vue';

import { app } from '~/stores/app';

const router = useRouter();
const route = useRoute();

const { currentNavigationItem } = storeToRefs(app());
const { countryNames, publicationNames } = storeToRefs(stores.coa());

const { t } = useI18n();

const parts = computed(() => {
  const parts: { text?: string; id: string; component?: any; badge?: string }[] = [
    {
      id: '',
      text: t('Tous les pays'),
    },
  ];
  const { countrycode, magazinecode } = route.params as { countrycode?: string; magazinecode?: string };
  if (countrycode) {
    parts.push({
      component: Country,
      id: countrycode,
      text: countryNames.value?.[countrycode] || countrycode,
    });
    if (magazinecode) {
      const publicationcode = `${countrycode}/${magazinecode}`;
      parts.push({
        component: Publication,
        id: publicationcode,
        text: publicationNames.value[publicationcode]!,
      });
    }
  }
  return parts;
});

const onChange = (event: { detail: { value?: number | string } }) => {
  const [countrycode, magazinecode] = (event.detail.value as string)?.split('/') || [];
  router.push({
    name: 'Collection',
    params: { ...route.params, countrycode, magazinecode },
    query: { coa: route.query.coa },
  });
};
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
  white-space: normal;
  padding: 0.5rem;

  ion-badge {
    margin-top: 8px;
  }

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
