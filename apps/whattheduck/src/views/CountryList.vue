<template>
  <List
    :items="sortedItems"
    :stat-numerators="totalPerCountry"
    :stat-denominators="issueCountsPerCountry"
    :get-target-route-fn="getTargetUrlFn"
  >
    <template #row-label="{ text }">
      <Country :value="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouteLocation, RouteLocationNamedRaw, RouteLocationRaw, useRoute, useRouter } from 'vue-router';
import Country from '~/components/Country.vue';
import List from '~/components/List.vue';
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

const items = computed((): { key: string; text: string }[] =>
  coaStore.countryNames
    ? appStore.isCoaView
      ? Object.entries(coaStore.countryNames).map(([key, text]) => ({
          key,
          text,
        }))
      : collectionStore.ownedCountries.map((countryCode) => ({
          key: countryCode,
          text: coaStore.countryNames![countryCode] || countryCode,
        }))
    : []
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) => text1.toLowerCase().localeCompare(text2.toLowerCase()))
);

const getTargetUrlFn = (key: string): Pick<RouteLocationNamedRaw, 'name' | 'params'> => ({
  name: 'PublicationList',
  params: { type: route.params.type, countrycode: key },
});

collectionStore.fetchAndTrackCollection().catch(() => {
  router.replace('/');
});
</script>
