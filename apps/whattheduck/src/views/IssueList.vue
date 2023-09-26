<template>
  <List
    v-if="hasCoaData"
    :items="sortedItems"
    :get-target-route-fn="getTargetUrlFn"
    :ownership-text-fn="(ownership) => `${ownership[0]}/${ownership[1]}`"
  >
    <template #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaList" />
      <Condition :value="getConditionKey(item.condition)" />
    </template>
    <template #row-label="{ text }">
      {{ text }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import useCondition from '~/composables/useCondition';
import { Issue } from '~/persistence/models/dm/Issue';
import { app } from '~/stores/app';
import type { IssueWithPublicationcode } from '~/stores/collection';
import { collection } from '~/stores/collection';

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

const isCoaList = computed(() => route.params.type === 'coa');

const hasCoaData = computed(() => !!coaStore.issueNumbers?.[publicationcode.value]);

const ISSUECODE_REGEX = /^(?<countrycode>[^/]+)\/(?<magazinecode>[^ ]+) (?<issuenumber>.+)/;
const getTargetUrlFn = (key: string): Pick<RouteLocationNamedRaw, 'name' | 'params'> => ({
  name: 'OwnedIssueCopies',
  params: { type: route.params.type, ...key.match(ISSUECODE_REGEX)!.groups },
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

const items = computed((): { key: string; text: string; item: Issue }[] =>
  coaIssues.value
    ? appStore.isCoaView
      ? coaIssues.value.map(({ issuenumber }) => ({
          key: `${publicationcode.value} ${issuenumber}`,
          text: issuenumber,
          item: userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber)!,
        }))
      : (collectionStore.collection || [])
          .filter((issue) => issue.publicationcode === publicationcode.value)
          .map(({ issuenumber, ...issue }) => ({
            key: `${publicationcode.value} ${issuenumber}`,
            text: issuenumber,
            item: { ...issue, issuenumber }!,
          }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value]
    .sort(({ text: text1 }, { text: text2 }) =>
      Math.sign(coaIssuenumbers.value!.indexOf(text1) - coaIssuenumbers.value!.indexOf(text2)),
    )
    .map((item, idx, allItems) => {
      const currentItemCoaIndex = coaIssuenumbers.value!.indexOf(item.text);
      const nextItemCoaIndex = coaIssuenumbers.value!.indexOf(allItems[idx + 1]?.text);
      return {
        ...item,
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
