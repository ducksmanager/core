<template>
  <List v-if="hasCoaData" :items="sortedItems" :get-target-route-fn="getTargetUrlFn">
    <template #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaList"></ion-checkbox>
      <Condition :value="getConditionKey(item)" />
    </template>
    <template #row-label="{ text }">
      <Issue :value="text" />
    </template>
  </List>
</template>

<script setup lang="ts">
import { IssueWithPublicationcode, collection } from '~/stores/collection';
import { computed } from 'vue';
import { condition } from '~/stores/condition';
import { coa } from '~/stores/coa';
import { RouteLocationNamedRaw, useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { app } from '~/stores/app';
import useCondition from '~/composables/useCondition';

const route = useRoute();
const router = useRouter();

const collectionStore = collection();
const coaStore = coa();
const conditionStore = condition();
const appStore = app();

const { getConditionKey } = useCondition();

defineSlots<{
  rowPrefix: { item: IssueWithPublicationcode };
  rowLabel: { text: string };
}>();

const isCoaList = computed(() => route.params.type === 'coa');
const conditionL10n = computed(() => conditionStore.conditionL10n);

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
  { immediate: true }
);

const coaIssues = computed(() => coaStore.issuesWithTitles[publicationcode.value]);
const coaIssuenumbers = computed(() => coaIssues.value?.map(({ issuenumber }) => issuenumber));
const userIssues = computed(() =>
  (collectionStore.collection || []).filter((issue) => issue.publicationcode === publicationcode.value)
);

const items = computed((): { key: string; text: string }[] =>
  coaIssues.value
    ? appStore.isCoaView
      ? coaIssues.value.map(({ issuenumber }) => ({
          key: `${publicationcode.value} ${issuenumber}`,
          text: issuenumber,
          ...(userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber) || {}),
        }))
      : (collectionStore.collection || [])
          .filter((issue) => issue.publicationcode === publicationcode.value)
          .map(({ issuenumber, ...issue }) => ({
            key: `${publicationcode.value} ${issuenumber}`,
            text: issuenumber,
            ...issue,
          }))
    : []
);

const sortedItems = computed(() =>
  [...items.value].sort(({ text: text1 }, { text: text2 }) =>
    Math.sign(coaIssuenumbers.value!.indexOf(text1) - coaIssuenumbers.value!.indexOf(text2))
  )
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
