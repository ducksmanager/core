<template>
  <List v-if="hasCoaData" :items="sortedItems" :get-target-url-fn="getTargetUrlFn">
    <template #prefix="{ item }">
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
import { useRoute } from 'vue-router';

const route = useRoute();

const collectionStore = collection();
const coaStore = coa();
const conditionStore = condition();
const conditionL10n = computed(() => conditionStore.conditionL10n);

const hasCoaData = computed(() => !!coaStore.issueNumbers?.[publicationcode.value]);

const getTargetUrlFn = (routePath: string, key: string) => `/collection/${key.replace(routePath, '')}`;

const getConditionKey = (item: IssueWithPublicationcode) =>
  conditionL10n.value.find(({ fr }) => fr === item.condition)?.en || 'none';

const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);

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
  return coaStore.issueNumbers[publicationcode.value || '']
    .filter((issuenumber) => keys.includes(`${publicationcode.value} ${issuenumber}`))
    .map((issuenumber) => ({
      key: `${publicationcode.value} ${issuenumber}`,
      text: issuenumber,
      ...items.value.find(({ key }) => key === `${publicationcode.value} ${issuenumber}`),
    }));
});

(async () => {
  await collection().loadCollection();
  await coaStore.fetchIssueNumbers([publicationcode.value]);
})();
</script>
