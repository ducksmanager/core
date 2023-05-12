<template>
  <List
    :items="sortedItems"
    :stat-numerators="totalPerCountry"
    :stat-denominators="issueCounts"
    :get-target-url-fn="getTargetUrlFn"
  >
    <template #row-label="{ text }">
      <Publication :value="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Publication from '~/components/Publication.vue';
import List from '~/components/List.vue';
import { coa } from '~/stores/coa';
import { collection } from '~/stores/collection';
import { useRoute } from 'vue-router';

const collectionStore = collection();
const coaStore = coa();

const totalPerCountry = computed(() => collectionStore.totalPerCountry);
const issueCounts = computed(() => coaStore.issueCounts!);

const route = useRoute();

const getTargetUrlFn = (routePath: string, key: string) => `${routePath}/${key}`;
const items = computed((): { key: string; text: string }[] =>
  collectionStore.ownedPublications
    .filter((publication) => publication.indexOf(`${route.params.countrycode}/`) === 0)
    .map((publicationCode) => ({
      key: publicationCode.split('/')[1],
      text: coaStore.publicationNames?.[publicationCode] || publicationCode,
    }))
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) => text1.toLowerCase().localeCompare(text2.toLowerCase()))
);

(async () => {
  await collection().loadCollection();
  await coa().fetchPublicationNamesFromCountry(route.params.countrycode as string);
})();
</script>
