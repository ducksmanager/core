<template>
  <List
    :items="sortedItems"
    :stat-numerators="totalPerCountry"
    :stat-denominators="issueCountsPerCountry"
    :get-target-route-fn="getTargetUrlFn"
    :ownership-text-fn="ownershipText"
    :get-item-text-fn="getItemTextFn"
  >
    <template #row-label="{ item }">
      <Country v-bind="getItemTextFn(item)" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { collection } from '~/stores/collection';

const router = useRouter();
const route = useRoute();
const collectionStore = collection();
const coaStore = stores.coa();

const totalPerCountry = computed(() => collectionStore.totalPerCountry);
const issueCountsPerCountry = computed(() => coaStore.issueCountsPerCountry!);

const items = computed(() =>
  coaStore.countryNames
    ? Object.entries(coaStore.countryNames).map(([countrycode, countryname]) => ({
        key: countrycode,
        item: { countrycode, countryname },
      }))
    : [],
);

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.countryname || item.countrycode;

const ownershipText = (ownership: [number, number], fillPercentage: number | undefined) =>
  `${ownership[0]} (${fillPercentage! < 0.1 ? '< 0.1' : fillPercentage!.toFixed(1)}%)`;

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
