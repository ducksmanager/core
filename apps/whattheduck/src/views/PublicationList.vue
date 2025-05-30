<template>
  <List
    v-if="totalPerPublicationWithoutDuplicates && coaIssueCountsByPublicationcode && ownershipPercentages"
    :items="sortedItems"
    :get-item-text-fn="getItemTextFn"
    item-type="publicationcode"
  >
    <template #fill-bar="{ item }">
      <ion-progress-bar
        v-if="ownershipPercentages[item.publicationcode]"
        :value="ownershipPercentages[item.publicationcode].ownershipPercentage || 0"
      />
    </template>
    <template #row-label="{ item }">
      <Publication :title="item.publicationname" />
    </template>
    <template #row-suffix="{ item }">
      <template v-if="ownershipPercentages[item.publicationcode]">
        {{
          ownershipPercentages[item.publicationcode]
            ? getOwnershipText(ownershipPercentages[item.publicationcode], false)
            : ''
        }}</template
      >
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { getOwnershipPercentages, getOwnershipText } from '~/composables/useOwnership';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { coaIssueCountsByPublicationcode, totalPerPublicationWithoutDuplicates, ownedPublications } =
  storeToRefs(wtdcollection());
const { fetchPublicationNamesFromCountry } = stores.coa();
const { publicationNames } = storeToRefs(stores.coa());
const { countrycode, isCoaView } = storeToRefs(app());

const ownershipPercentages = computed(
  () =>
    coaIssueCountsByPublicationcode.value &&
    totalPerPublicationWithoutDuplicates.value &&
    getOwnershipPercentages(totalPerPublicationWithoutDuplicates.value, coaIssueCountsByPublicationcode.value),
);

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.publicationname || item.publicationcode;

const items = computed(() =>
  publicationNames.value
    ? isCoaView.value
      ? Object.entries(publicationNames.value)
          .filter(([publicationcode]) => publicationcode.startsWith(`${countrycode.value}/`))
          .map(([publicationcode, publicationname]) => ({
            key: publicationcode,
            item: { publicationcode, publicationname },
          }))
      : ownedPublications
          .value!.filter(
            (publicationcode) =>
              publicationcode.startsWith(`${countrycode.value}/`) && publicationNames.value![publicationcode],
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

watch(
  [isCoaView, countrycode],
  async () => {
    if (isCoaView.value) {
      await fetchPublicationNamesFromCountry(countrycode.value!);
    }
  },
  { immediate: true },
);

const hasItems = computed(() => sortedItems.value.length);

defineExpose({ hasItems });
</script>
