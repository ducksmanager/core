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
import Issue from '~/components/Issue.vue';
import Condition from '~/components/Condition.vue';
import List from '~/components/List.vue';
import { IssueWithPublicationcode, collection } from '~/stores/collection';
import { computed } from 'vue';
import { condition } from '~/stores/condition';
import { coa } from '~/stores/coa';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { app } from '~/stores/app';

const route = useRoute();
const router = useRouter();

const collectionStore = collection();
const coaStore = coa();
const conditionStore = condition();
const appStore = app();

defineSlots<{
  rowPrefix: { item: IssueWithPublicationcode };
  rowLabel: { text: string };
}>();

const isCoaList = computed(() => route.params.type === 'coa');
const conditionL10n = computed(() => conditionStore.conditionL10n);

const hasCoaData = computed(() => !!coaStore.issueNumbers?.[publicationcode.value]);

const getTargetUrlFn = (routePath: string, key: string) =>
  `/collection/${key.replace(routePath, '').replace(' ', '/')}`;

const getConditionKey = (item: IssueWithPublicationcode) =>
  conditionL10n.value.find(({ fr }) => fr === item.condition)?.en || 'none';

const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);

watch(
  () => publicationcode.value,
  async (newValue) => {
    appStore.currentNavigationItem = newValue as string;
  },
  { immediate: true }
);

const items = computed(() =>
  (collectionStore.collection || [])
    .filter((issue) => issue.publicationcode === publicationcode.value)
    .map(({ issuenumber, ...issue }) => ({
      key: `${issue.publicationcode} ${issuenumber}`,
      text: issuenumber,
      ...issue,
    }))
);

const sortedItems = computed(() => {
  const keys = items.value.map(({ key }) => key);
  const publicationItems = coaStore.issueNumbers[publicationcode.value || ''];
  const filteredItems: { issuenumber: string; ownsNext: boolean }[] = [];
  publicationItems.forEach((issuenumber, idx) => {
    if (keys.includes(`${publicationcode.value} ${issuenumber}`)) {
      filteredItems.push({
        issuenumber,
        ownsNext: keys.includes(`${publicationcode.value} ${publicationItems[idx + 1]}`),
      });
    }
  });
  return filteredItems.map(({ issuenumber, ownsNext }) => ({
    key: `${publicationcode.value} ${issuenumber}`,
    text: issuenumber,
    ownsNext,
    ...items.value.find(({ key }) => key === `${publicationcode.value} ${issuenumber}`),
  }));
});

collectionStore.fetchAndTrackCollection().catch(() => {
  router.replace('/');
});
</script>
