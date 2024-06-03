<template>
  <ion-segment v-model="currentNavigationItem">
    <ion-col :size="[1, maxParts].includes(partIdx) ? 2 : 4" v-for="partIdx in maxParts">
      <ion-segment-button
        :id="shownParts[partIdx - 1]?.id || partIdx - 1"
        :value="partIdx - 1"
        :class="{ invisible: partIdx < shownParts.length }"
      >
        <template v-if="shownParts[partIdx - 1]">
          <component
            v-if="shownParts[partIdx - 1].component"
            :is="shownParts[partIdx - 1].component"
            :id="shownParts[partIdx - 1].id"
            :label="shownParts[partIdx - 1].text"
          />
          <ion-label v-else>{{ shownParts[partIdx - 1].text }}</ion-label>
        </template>
      </ion-segment-button></ion-col
    >
  </ion-segment>
</template>

<script setup lang="ts">
import { stores } from '~web';

import Country from './Country.vue';
import EditIcon from './EditIcon.vue';
import GlobeIcon from './GlobeIcon.vue';
import Publication from './Publication.vue';

import { app } from '~/stores/app';

const { currentNavigationItem, navigationItemGroups } = storeToRefs(app());
const { countryNames, publicationNames } = storeToRefs(stores.coa());

const maxParts = 4;

const shownParts = computed(() => {
  const parts: { text?: string; id: string; component?: any; badge?: string }[] = [
    {
      id: '',
      component: GlobeIcon,
      text: '',
    },
  ];
  const { countrycode, magazinecode, issuenumber } = navigationItemGroups.value;

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
      component: EditIcon,
      id: currentNavigationItem.value!,
    });
  }
  return parts;
});
</script>

<style lang="scss" scoped>
ion-segment {
  display: flex;
  justify-content: start;
  height: 48px;
  background-color: var(--ion-background-color);
}

ion-segment-button {
  align-items: center;
  text-transform: none;
  white-space: normal;
  min-width: initial;

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
