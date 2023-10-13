<template>
  <List
    :items="sortedItems"
    :fill-percentages="ownershipPercentages"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
  >
    <template #row-label="{ item }">
      <Country v-bind="item" />
    </template>
    <template #row-suffix="{ item }" v-if="ownershipPercentages">
      {{ getOwnershipText(ownershipPercentages[item.countrycode]) }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';
import { getOwnershipText, getOwnershipPercentages } from '~/composables/useOwnership';

import { collection } from '~/stores/collection';
import { app } from '~/stores/app';

const router = useRouter();
const route = useRoute();
const collectionStore = collection();
const coaStore = stores.coa();
const appStore = app();

const totalPerCountry = computed(() => collectionStore.totalPerCountry);
const issueCountsPerCountry = computed(() => coaStore.issueCountsPerCountry!);

const ownershipPercentages = computed(() =>
  getOwnershipPercentages(totalPerCountry.value, issueCountsPerCountry.value),
);

const items = computed(() =>
  coaStore.countryNames
    ? Object.entries(coaStore.countryNames)
        .filter(([countrycode]) => appStore.isCoaView || collectionStore.ownedCountries.includes(countrycode))
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

collectionStore.fetchAndTrackCollection().catch(() => {
  router.push('/');
});
</script>
<style lang="scss">
img {
  width: 18px;
  margin-right: 1rem;
}
</style>
