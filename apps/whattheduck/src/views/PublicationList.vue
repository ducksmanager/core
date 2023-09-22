<template>
  <List
    v-if="collectionStore.totalPerPublication && coaStore.issueCounts"
    :items="sortedItems"
    :stat-numerators="totalPerPublication"
    :stat-denominators="issueCounts"
    :get-target-route-fn="getTargetUrlFn"
    :ownership-text-fn="(ownership) => `${ownership[0]}/${ownership[1]}`"
  >
    <template #row-label="{ text }">
      <Publication :value="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import router from '~/router';
import { app } from '~/stores/app';
import { collection } from '~/stores/collection';

const collectionStore = collection();
const coaStore = stores.coa();
const appStore = app();

const getIssueCountPerMagazinecode = (issueCountPerPublicationcode: Record<string, number>) =>
  Object.entries(issueCountPerPublicationcode)
    .filter(([publicationcode]) => publicationcode.startsWith(`${route.params.countrycode}/`))
    .reduce((acc, [publicationcode, total]) => ({ ...acc, [publicationcode]: total }), {});

const totalPerPublication = computed(
  () =>
    (collectionStore.totalPerPublication && getIssueCountPerMagazinecode(collectionStore.totalPerPublication)) ||
    undefined,
);
const issueCounts = computed(() => getIssueCountPerMagazinecode(coaStore.issueCounts || {}));

const route = useRoute();

watch(
  () => route.params.countrycode,
  async (newValue) => {
    appStore.currentNavigationItem = newValue as string;
  },
  { immediate: true },
);

const getTargetUrlFn = (key: string): Pick<RouteLocationNamedRaw, 'name' | 'params'> => ({
  name: 'IssueList',
  params: { type: route.params.type, countrycode: key.split('/')[0], magazinecode: key.split('/')[1] },
});

const items = computed((): { key: string; text: string }[] =>
  coaStore.publicationNames
    ? appStore.isCoaView
      ? Object.entries(coaStore.publicationNames)
          .filter(([publicationcode]) => new RegExp(`^${route.params.countrycode}/`).test(publicationcode))
          .map(([key, text]) => ({ key, text }))
      : collectionStore.ownedPublications
          .filter((publication) => publication.indexOf(`${route.params.countrycode}/`) === 0)
          .map((publicationCode) => ({
            key: publicationCode,
            text: coaStore.publicationNames?.[publicationCode] || publicationCode,
          }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) => text1.toLowerCase().localeCompare(text2.toLowerCase())),
);

collectionStore.fetchAndTrackCollection().catch(() => {
  router.push('/');
});
</script>
