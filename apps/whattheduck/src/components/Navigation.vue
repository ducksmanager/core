<template>
  <ion-segment
    :model-value="JSON.stringify(shownParts[shownParts.length - 1])"
    @update:model-value="currentNavigationItem = JSON.parse($event)"
  >
    <ion-col
      v-for="partIdx in maxParts"
      v-show="partIdx <= shownParts.length"
      :key="partIdx"
      :class="{ 'non-clickable': partIdx >= shownParts.length, scrollable: partIdx === 3 }"
      :size="[1, maxParts].includes(partIdx) ? '2' : '4'"
      @click.stop="() => {}"
    >
      <ion-segment-button
        :value="JSON.stringify(shownParts[partIdx - 1])"
        @click="currentNavigationItem = shownParts[partIdx - 1] as typeof currentNavigationItem"
      >
        <globe-icon v-if="partIdx === 1" />
        <Country
          v-if="partIdx === 2 && countrycode"
          :id="countrycode"
          :label="countryNames?.[countrycode] || countrycode"
        />
        <Publication
          v-if="partIdx === 3 && publicationcode"
          :title="publicationNames?.[publicationcode] || publicationcode"
        />
        <template v-if="partIdx === 4 && issuecodes"
          ><div style="display: flex; align-items: center">
            <Issue :issuecode="issuecodes[0]" /><template v-if="issuecodes.length > 1"
              ><ion-chip :outline="true">+&nbsp;{{ issuecodes.length - 1 }}</ion-chip></template
            >
          </div></template
        >
      </ion-segment-button></ion-col
    >
  </ion-segment>
</template>

<script setup lang="ts">
import { stores } from '~web';

import Country from './Country.vue';
import GlobeIcon from './GlobeIcon.vue';
import Issue from './Issue.vue';
import Publication from './Publication.vue';

import { app } from '~/stores/app';

const { currentNavigationItem, countrycode, publicationcode, issuecodes } = storeToRefs(app());
const { countryNames, publicationNames } = storeToRefs(stores.coa());

const maxParts = 4;

const shownParts = computed(() => [
  { type: 'all', value: 'all' },
  ...(Object.entries({
    countrycode: countrycode.value,
    publicationcode: publicationcode.value,
    issuecodes: issuecodes.value,
  })
    .map(([type, value]) => (value ? { type, value } : null))
    .filter(Boolean) as (typeof currentNavigationItem)['value'][]),
]);
</script>

<style lang="scss" scoped>
ion-segment {
  display: flex;
  justify-content: start;
  height: 48px;
  background-color: var(--ion-background-color);

  ion-col {
    padding: 0 !important;
    display: flex;
    justify-content: center;
    align-items: center;

    &.scrollable {
      display: block;
      overflow: auto;
    }
  }

  ion-segment-button {
    width: 100%;
    height: 100%;
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
}
</style>
