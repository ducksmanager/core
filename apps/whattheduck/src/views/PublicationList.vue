<template>
  <List
    v-if="collectionStore.totalPerPublication && coaStore.issueCounts"
    :items="sortedItems"
    :stat-numerators="totalPerPublication"
    :stat-denominators="issueCounts"
    :get-target-url-fn="getTargetUrlFn"
  >
    <template #row-label="{ text }">
      <Publication :value="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import Publication from '~/components/Publication.vue';
import List from '~/components/List.vue';
import { coa } from '~/stores/coa';
import { app } from '~/stores/app';
import { collection } from '~/stores/collection';
import { useRoute } from 'vue-router';

const collectionStore = collection();
const coaStore = coa();
const appStore = app();

const getIssueCountPerMagazinecode = (issueCountPerPublicationcode: Record<string, number>) =>
  Object.entries(issueCountPerPublicationcode)
    .filter(([publicationcode]) => publicationcode.startsWith(`${route.params.countrycode}/`))
    .reduce((acc, [publicationcode, total]) => ({ ...acc, [publicationcode]: total }), {});

const totalPerPublication = computed(() => getIssueCountPerMagazinecode(collectionStore.totalPerPublication));
const issueCounts = computed(() => getIssueCountPerMagazinecode(coaStore.issueCounts || {}));

const route = useRoute();

watch(
  () => route.params.countrycode,
  async (newValue) => {
    appStore.currentNavigationItem = newValue as string;
  },
  { immediate: true }
);

const getTargetUrlFn = (routePath: string, key: string) => `${routePath}/${key.split('/')[1]}`;
const items = computed((): { key: string; text: string }[] =>
  collectionStore.ownedPublications
    .filter((publication) => publication.indexOf(`${route.params.countrycode}/`) === 0)
    .map((publicationCode) => ({
      key: publicationCode,
      text: coaStore.publicationNames?.[publicationCode] || publicationCode,
    }))
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) => text1.toLowerCase().localeCompare(text2.toLowerCase()))
);

collectionStore.loadCollection();
coaStore.fetchPublicationNamesFromCountry(route.params.countrycode as string);
coaStore.fetchIssueCounts();
</script>
