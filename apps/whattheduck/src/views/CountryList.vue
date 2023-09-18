<template>
  <List
    :items="sortedItems"
    :stat-numerators="totalPerCountry"
    :stat-denominators="issueCountsPerCountry"
    :get-target-route-fn="getTargetUrlFn"
    :ownership-text-fn="ownershipText"
  >
    <template #row-label="{ key, text }">
      <Country :countrycode="key" :countryname="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { app } from '~/stores/app';
import { coa } from '~/stores/coa';
import { collection } from '~/stores/collection';

const router = useRouter();
const route = useRoute();
const collectionStore = collection();
const coaStore = coa();
const appStore = app();

const totalPerCountry = computed(() => collectionStore.totalPerCountry);
const issueCountsPerCountry = computed(() => coaStore.issueCountsPerCountry!);

const ownershipText = (ownership: [number, number], fillPercentage: number | undefined) =>
  `${ownership[0]} (${fillPercentage! < 0.1 ? '< 0.1' : fillPercentage!.toFixed(1)}%)`;

const items = computed((): { key: string; text: string }[] =>
  coaStore.countryNames
    ? appStore.isCoaView
      ? coaStore.countryNames.map(({ countrycode, countryname }) => ({
          key: countrycode,
          text: countryname || countrycode,
        }))
      : collectionStore.ownedCountries.map((countryCode) => ({
          key: countryCode,
          text:
            coaStore.countryNames?.find(({ countrycode }) => countrycode === countryCode)?.countryname || countryCode,
        }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) => text1.toLowerCase().localeCompare(text2.toLowerCase())),
);

const getTargetUrlFn = (key: string): Pick<RouteLocationNamedRaw, 'name' | 'params'> => ({
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
