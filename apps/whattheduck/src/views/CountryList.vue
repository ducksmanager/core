<template>
  <List
    :items="sortedItems"
    :fill-percentages="ownershipPercentages"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
  >
    <template #row-label="{ item }">
      <Country :id="item.countrycode" :label="item.countryname" />
    </template>
    <template #row-suffix="{ item }" v-if="ownershipPercentages">
      {{ ownershipPercentages[item.countrycode] ? getOwnershipText(ownershipPercentages[item.countrycode]) : '' }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { getOwnershipText, getOwnershipPercentages } from '~/composables/useOwnership';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const route = useRoute();
const { totalPerCountry, ownedCountries } = storeToRefs(wtdcollection());
const { issueCountsPerCountry, countryNames } = storeToRefs(stores.coa());
const { isCoaView } = storeToRefs(app());

const ownershipPercentages = computed(() =>
  getOwnershipPercentages(totalPerCountry.value, issueCountsPerCountry.value!),
);

const items = computed(() =>
  countryNames.value
    ? Object.entries(countryNames.value)
        .filter(([countrycode]) => isCoaView.value || ownedCountries.value!.includes(countrycode))
        .map(([countrycode, countryname]) => ({
          key: countrycode,
          item: { countrycode, countryname },
        }))
    : [],
);

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.countryname || item.countrycode;

const sortedItems = computed(() =>
  [...items.value].sort(({ item: { countryname: text1 } }, { item: { countryname: text2 } }) =>
    text1.toLowerCase().localeCompare(text2.toLowerCase()),
  ),
);

const getTargetUrlFn = (key: string) => ({
  name: 'PublicationList',
  params: { type: route.params.type, countrycode: key },
});
</script>
