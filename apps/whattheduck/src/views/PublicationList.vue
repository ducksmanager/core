<template>
  <List
    v-if="collectionStore.totalPerPublication && coaStore.issueCounts"
    :items="sortedItems"
    :stat-numerators="totalPerPublication"
    :stat-denominators="issueCounts"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
    :ownership-text-fn="(ownership) => `${ownership[0]}/${ownership[1]}`"
  >
    <template #row-label="{ item }">
      <Publication v-bind="item" />
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

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.publicationname || item.publicationcode;

const getTargetUrlFn = (key: string) => ({
  name: 'IssueList',
  params: { type: route.params.type, countrycode: key.split('/')[0], magazinecode: key.split('/')[1] },
});

const items = computed(() =>
  coaStore.publicationNames
    ? appStore.isCoaView
      ? Object.entries(coaStore.publicationNames)
          .filter(([publicationcode]) => new RegExp(`^${route.params.countrycode}/`).test(publicationcode))
          .map(([publicationcode, publicationname]) => ({
            key: publicationcode,
            item: { publicationcode, publicationname },
          }))
      : collectionStore.ownedPublications
          .filter((publication) => publication.indexOf(`${route.params.countrycode}/`) === 0)
          .map((publicationcode) => ({
            key: publicationcode,
            item: {
              publicationcode,
              publicationname: coaStore.publicationNames?.[publicationcode] || publicationcode,
            },
          }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value].sort(({ item: { publicationname: text1 } }, { item: { publicationname: text2 } }) =>
    text1.toLowerCase().localeCompare(text2.toLowerCase()),
  ),
);

collectionStore.fetchAndTrackCollection().catch(() => {
  router.push('/');
});
</script>
