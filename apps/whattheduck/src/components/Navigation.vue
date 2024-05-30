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
import GlobeIcon from './GlobeIcon.vue';
import OwnedIssueCopiesModal from './OwnedIssueCopiesModal.vue';
import Publication from './Publication.vue';

import { app } from '~/stores/app';

const { currentNavigationItem } = storeToRefs(app());
const { countryNames, publicationNames } = storeToRefs(stores.coa());
const { ISSUECODE_REGEX } = stores.coa();

const parts = computed(() => {
  const parts: { text?: string; id: string; component?: any; badge?: string }[] = [
    {
      id: '',
      component: GlobeIcon,
      text: '',
    },
  ];
  let countrycode: string | undefined, magazinecode: string | undefined, issuenumber: string | undefined;
  const issuecodeGroups = ISSUECODE_REGEX.exec(currentNavigationItem.value || '')?.groups;
  if (issuecodeGroups) {
    ({ countrycode, magazinecode, issuenumber } = issuecodeGroups);
  } else {
    [countrycode, magazinecode] = currentNavigationItem.value?.split('/') || [];
  }
  if (countrycode) {
    parts.push({
      component: Country,
      id: countrycode,
      text: countryNames.value?.[countrycode] || countrycode,
    });
  }
  if (magazinecode) {
    parts.push({
      component: Publication,
      id: `${countrycode}/${magazinecode}`,
      text: publicationNames.value[currentNavigationItem.value!],
    });
  }
  if (issuenumber !== undefined) {
    parts.push({
      component: OwnedIssueCopiesModal,
      id: currentNavigationItem.value!,
      text: '...',
    });
  }
  return parts;
});

const onChange = (event: { detail: { value?: number | string } }) => {
  currentNavigationItem.value = event.detail.value as string;
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
  // width: 33.333%;
  // max-width: 33.333%;
  align-items: center;
  text-transform: none;
  white-space: normal;

  &:first-child,
  &:last-child {
    flex-shrink: 1;
  }

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
