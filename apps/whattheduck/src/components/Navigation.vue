<template>
  <ion-segment v-model="currentNavigationItem">
    <ion-col :size="[1, maxParts].includes(partIdx) ? '2' : '4'" v-for="partIdx in maxParts">
      <ion-segment-button :value="shownParts[partIdx - 1]" :class="{ invisible: partIdx < shownParts.length }">
        <globe-icon v-if="partIdx === 1" />
        <Country
          v-if="partIdx === 2 && countrycode"
          :id="countrycode"
          :label="countryNames?.[countrycode] || countrycode" />
        <Publication
          v-if="partIdx === 3 && publicationcode"
          :publicationcode="publicationcode"
          :title="publicationNames?.[publicationcode] || publicationcode" />
        <EditIcon v-if="partIdx === 4 && issuenumber !== undefined" /></ion-segment-button
    ></ion-col>
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

const countrycode = computed(() => navigationItemGroups.value.countrycode);
const magazinecode = computed(() => navigationItemGroups.value.magazinecode);
const issuenumber = computed(() => navigationItemGroups.value.issuenumber);
const publicationcode = computed(() => magazinecode.value && `${countrycode.value}/${magazinecode.value}`);

const shownParts = computed(() => {
  const parts = [''];

  if (countrycode.value) {
    parts.push(countrycode.value);
  }
  if (magazinecode) {
    parts.push(`${countrycode.value}/${magazinecode.value}`);
  }
  if (issuenumber.value !== undefined) {
    parts.push(currentNavigationItem.value!);
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
