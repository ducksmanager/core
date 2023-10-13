<template>
  <List v-if="hasCoaData" :items="sortedItems" :get-target-route-fn="getTargetUrlFn" :get-item-text-fn="getItemTextFn">
    <template #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaList" />
      <Condition :value="getConditionKey(item.condition)" />
    </template>
    <template #row-label="{ item }">
      <Issue v-bind="item" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import useCondition from '~/composables/useCondition';
import type { Issue } from '~/persistence/models/dm/Issue';
import { app } from '~/stores/app';
import type { IssueWithPublicationcode } from '~/stores/collection';
import { collection } from '~/stores/collection';
import { ISSUECODE_REGEX } from '~web/src/stores/coa';

const route = useRoute();
const router = useRouter();

const collectionStore = collection();
const coaStore = stores.coa();
const appStore = app();

const { getConditionKey } = useCondition();

defineSlots<{
  rowPrefix: { item: IssueWithPublicationcode };
  rowLabel: { text: string };
}>();

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.issuenumber;

const isCoaList = computed(() => route.params.type === 'coa');

const hasCoaData = computed(() => !!coaStore.issueNumbers?.[publicationcode.value]);

const getTargetUrlFn = (key: string) => ({
  name: 'OwnedIssueCopies',
  params: key.match(ISSUECODE_REGEX)!.groups,
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
  (collectionStore.collection || []).filter((issue) => issue.publicationcode === publicationcode.value),
);

const items = computed(() =>
  coaIssues.value
    ? appStore.isCoaView
      ? coaIssues.value.map(({ issuenumber }) => ({
          key: `${publicationcode.value} ${issuenumber}`,
          item: userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber)!,
        }))
      : (collectionStore.collection || [])
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
