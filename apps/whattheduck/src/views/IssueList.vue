<template>
  <List v-if="hasCoaData" :items="sortedItems" :get-target-route-fn="getTargetUrlFn" :get-item-text-fn="getItemTextFn">
    <template #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaList" />
      <Condition :value="getConditionText(item.condition)" />
    </template>
    <template #row-label="{ item }">
      <Issue v-bind="item" />
    </template>
  </List>
</template>

<script setup lang="ts">
import type { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';
import { stores as webStores } from '~web';

import { getConditionText } from '~/composables/useCondition';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const route = useRoute();
const router = useRouter();

const collectionStore = wtdcollection();
const coaStore = webStores.coa();
const appStore = app();

defineSlots<{
  rowPrefix: { item: issueWithPublicationcode };
  rowLabel: { text: string };
}>();

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.issuenumber;

const isCoaList = computed(() => route.params.type === 'coa');

const hasCoaData = computed(() => !!coaStore.issueNumbers?.[publicationcode.value]);

const getTargetUrlFn = (key: string) => ({
  name: 'OwnedIssueCopies',
  params: key.match(coaStore.ISSUECODE_REGEX)!.groups,
});

const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);

watch(
  () => publicationcode.value,
  async (newValue) => {
    appStore.currentNavigationItem = newValue as string;
  },
  { immediate: true },
);

const coaIssues = computed(() => coaStore.issuesWithTitles[publicationcode.value]);
const coaIssuenumbers = computed(() => coaIssues.value?.map(({ issuenumber }) => issuenumber));
const userIssues = computed(() =>
  (collectionStore.issues || []).filter((issue) => issue.publicationcode === publicationcode.value),
);

const items = computed(() =>
  coaIssues.value
    ? appStore.isCoaView
      ? coaIssues.value.map(({ issuenumber }) => ({
          key: `${publicationcode.value} ${issuenumber}`,
          item: userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber)!,
        }))
      : (collectionStore.issues || [])
          .filter((issue) => issue.publicationcode === publicationcode.value)
          .map(({ issuenumber, ...issue }) => ({
            key: `${publicationcode.value} ${issuenumber}`,
            item: { ...issue, issuenumber }!,
          }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value]
    .sort(({ item: { issuenumber: issuenumber1 } }, { item: { issuenumber: issuenumber2 } }) =>
      Math.sign(coaIssuenumbers.value!.indexOf(issuenumber1) - coaIssuenumbers.value!.indexOf(issuenumber2)),
    )
    .map(({ key, item }, idx, allItems) => {
      const currentItemCoaIndex = coaIssuenumbers.value!.indexOf(item.issuenumber);
      const nextItemCoaIndex = coaIssuenumbers.value!.indexOf(allItems[idx + 1]?.item.issuenumber);
      return {
        key,
        item,
        ownsNext: nextItemCoaIndex === currentItemCoaIndex + 1,
      };
    }),
);

collectionStore
  .fetchAndTrackCollection()
  .then(() => {
    coaStore.fetchIssueNumbersWithTitles(publicationcode.value);
  })
  .catch(() => {
    router.push('/');
  });
</script>
