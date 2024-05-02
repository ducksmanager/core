<template>
  <List
    v-if="totalPerPublication && allIssueCounts"
    :items="sortedItems"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
  >
    <template #fill-bar="{ item }" v-if="ownershipPercentages">
      <ion-progress-bar :value="ownershipPercentages[item.publicationcode].ownershipPercentage || 0" />
    </template>
    <template #row-label="{ item }">
      <Publication :key="item.publicationcode" :label="item.publicationname" />
    </template>
    <template #row-suffix="{ item }" v-if="ownershipPercentages">
      {{
        ownershipPercentages[item.publicationcode]
          ? getOwnershipText(ownershipPercentages[item.publicationcode], false)
          : ''
      }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { getOwnershipPercentages, getOwnershipText } from '~/composables/useOwnership';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { issueCounts, totalPerPublication, ownedPublications } = storeToRefs(wtdcollection());
const { publicationNames } = storeToRefs(stores.coa());
const appStore = app();

const getIssueCountPerMagazinecode = (issueCountPerPublicationcode: Record<string, number>) =>
  Object.entries(issueCountPerPublicationcode)
    .filter(([publicationcode]) => publicationcode.startsWith(`${route.params.countrycode}/`))
    .reduce((acc, [publicationcode, total]) => ({ ...acc, [publicationcode]: total }), {});

const allIssueCounts = computed(() => issueCounts.value && getIssueCountPerMagazinecode(issueCounts.value));

const ownershipPercentages = computed(
  () =>
    issueCounts.value &&
    totalPerPublication.value &&
    getOwnershipPercentages(totalPerPublication.value, issueCounts.value),
);

const route = useRoute();

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.publicationname || item.publicationcode;

const getTargetUrlFn = (key: string) => ({
  name: 'IssueList',
  params: { type: route.params.type, publicationcode: key },
});

const items = computed(() =>
  publicationNames.value
    ? appStore.isCoaView
      ? Object.entries(publicationNames.value)
          .filter(([publicationcode]) => new RegExp(`^${route.params.countrycode}/`).test(publicationcode))
          .map(([publicationcode, publicationname]) => ({
            key: publicationcode,
            item: { publicationcode, publicationname },
          }))
      : ownedPublications
          .value!.filter(
            (publicationcode) =>
              publicationcode.indexOf(`${route.params.countrycode}/`) === 0 && publicationNames.value![publicationcode],
          )
          .map((publicationcode) => ({
            key: publicationcode,
            item: {
              publicationcode,
              publicationname: publicationNames.value![publicationcode] || publicationcode,
            },
          }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value].sort(({ item: { publicationname: text1 } }, { item: { publicationname: text2 } }) =>
    text1.toLowerCase().localeCompare(text2.toLowerCase()),
  ),
);
</script>
