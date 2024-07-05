<template>
  <ion-segment v-model="currentNavigationItem">
    <ion-col
      :class="{ 'non-clickable': partIdx >= shownParts.length }"
      :size="[1, maxParts].includes(partIdx) ? '2' : '4'"
      v-for="partIdx in maxParts"
      v-show="partIdx <= shownParts.length"
    >
      <ion-segment-button :value="shownParts[partIdx - 1]">
        <globe-icon v-if="partIdx === 1" />
        <Country
          v-if="partIdx === 2 && countrycode"
          :id="countrycode"
          :label="countryNames?.[countrycode] || countrycode"
        />
        <Publication
          v-if="partIdx === 3 && publicationcode"
          :publicationcode="publicationcode"
          :title="publicationNames?.[publicationcode] || publicationcode"
        />
        <template v-if="partIdx === 4 && issuenumber !== undefined"
          ><div>
            <Issue :issuenumber="issuenumber" /><template v-if="extraIssuenumbers.length"
              ><ion-chip :outline="true">+&nbsp;{{ extraIssuenumbers.length - 1 }}</ion-chip></template
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

const { currentNavigationItem, countrycode, publicationcode, issuenumber, extraIssuenumbers } = storeToRefs(app());
const { countryNames, publicationNames } = storeToRefs(stores.coa());

const maxParts = 4;

const shownParts = computed(() => {
  const parts = [''];

  if (countrycode.value) {
    parts.push(countrycode.value);
  }
  if (publicationcode.value) {
    parts.push(`${publicationcode.value}`);
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

  ion-col {
    padding: 0 !important;
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
}

.non-clickable {
  pointer-events: none;
}
</style>
