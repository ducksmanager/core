<template>
  <List
    :items="sortedItems"
    :stat-numerators="totalPerCountry"
    :stat-denominators="issueCountsPerCountry"
    :get-target-url-fn="getTargetUrlFn"
  >
    <template #row-label="{ text }">
      <Country :value="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Country from '~/components/Country.vue';
import List from '~/components/List.vue';
import { coa } from '~/stores/coa';
import { collection } from '~/stores/collection';

const collectionStore = collection();
const coaStore = coa();

const totalPerCountry = computed(() => collectionStore.totalPerCountry);
const issueCountsPerCountry = computed(() => coaStore.issueCountsPerCountry!);

const items = computed((): { key: string; text: string }[] =>
  collectionStore.ownedCountries.map((countryCode) => ({
    key: countryCode,
    text: coaStore.countryNames?.[countryCode] || countryCode,
  }))
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) => text1.toLowerCase().localeCompare(text2.toLowerCase()))
);

const getTargetUrlFn = (routePath: string, key: string) => `${routePath}/${key}`;

collection().loadCollection();
</script>
