<template>
  <List
    v-if="ownershipPercentages && sortedItems"
    :items="sortedItems"
    :get-item-text-fn="getItemTextFn"
    item-type="countrycode"
  >
    <template #empty>{{
      $t('Votre collection est vide. Ajoutez des numéros en utilisant le bouton en bas à droite :-)')
    }}</template>
    <template #fill-bar="{ item: { countrycode } }">
      <ion-progress-bar
        v-if="ownershipPercentages[countrycode]"
        type="determinate"
        :value="ownershipPercentages[countrycode].ownershipPercentage || 0"
      />
    </template>
    <template #row-suffix="{ item: { countrycode } }">
      {{ ownershipPercentages[countrycode] ? getOwnershipText(ownershipPercentages[countrycode]) : '' }}
    </template>
    <template #row-label="{ item }">
      <Country :id="item.countrycode" :label="item.countryname" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { getOwnershipText, getOwnershipPercentages } from '~/composables/useOwnership';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { totalPerCountryWithoutDuplicates, ownedCountries, coaIssueCountsPerCountrycode } = storeToRefs(wtdcollection());
const { countryNames } = storeToRefs(stores.coa());
const { isCoaView } = storeToRefs(app());

const ownershipPercentages = computed(() =>
  getOwnershipPercentages(totalPerCountryWithoutDuplicates.value, coaIssueCountsPerCountrycode.value!),
);

const items = computed(() =>
  ownedCountries.value && countryNames.value
    ? Object.entries(countryNames.value)
        .filter(([countrycode]) => isCoaView.value || ownedCountries.value!.includes(countrycode))
        .map(([countrycode, countryname]) => ({
          key: countrycode,
          item: { countrycode, countryname },
        }))
    : [],
);

const getItemTextFn = (item: (typeof items)['value'][number]['item']) => item.countryname || item.countrycode;

const sortedItems = computed(
  () =>
    items.value &&
    [...items.value].sort(({ item: { countryname: text1 } }, { item: { countryname: text2 } }) =>
      text1.toLowerCase().localeCompare(text2.toLowerCase()),
    ),
);

const hasItems = computed(() => sortedItems.value.length);

defineExpose({ hasItems });
</script>
