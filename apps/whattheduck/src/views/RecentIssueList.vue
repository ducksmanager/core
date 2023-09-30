<template>
  <List
    v-if="hasData"
    :items="sortedItems"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
    :ownership-text-fn="(ownership) => `${ownership[0]}/${ownership[1]}`"
  >
    <template #row-prefix="{ item }">
      <Condition v-if="item.owned" :value="getConditionKey(item.owned.condition)" />
    </template>
    <template #row-label="{ item }">
      {{ coaStore.publicationNames[item.publicationcode!] }} {{ item.issuenumber }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import useCondition from '~/composables/useCondition';
import { collection } from '~/stores/collection';
import { GET__coa__list__issues__recent } from '~api-routes/index';
import { ISSUECODE_REGEX } from '~web/src/stores/coa';
import { Issue } from '~/persistence/models/dm/Issue';

const router = useRouter();

const collectionStore = collection();
const coaStore = stores.coa();

const { getConditionKey } = useCondition();

type Item = GET__coa__list__issues__recent['resBody'][0] & { owned?: Issue };

defineSlots<{
  rowPrefix: { item: Item };
  rowLabel: { text: string };
}>();

const items = ref(undefined as Item[] | undefined);

const getItemTextFn = ({ publicationcode, issuenumber }: Item) =>
  `${coaStore.publicationNames[publicationcode!]} ${issuenumber}`;

const hasData = computed(() => !!items?.value?.length);

const getTargetUrlFn = (key: string) => ({
  name: 'OwnedIssueCopies',
  params: key.match(ISSUECODE_REGEX)!.groups,
});

const sortedItems = computed(() =>
  [...(items.value || [])]
    .sort((itemA, itemB) => (itemB.oldestdate! > itemA.oldestdate! ? -1 : 1))
    .map((item) => ({
      key: item.issuecode,
      item,
    })),
);

collectionStore
  .fetchAndTrackCollection()
  .then(async () => {
    items.value = (await coaStore.fetchRecentIssues()).map((item) => ({
      ...item,
      owned: collectionStore.findInCollection(item.publicationcode!, item.issuenumber!),
    }));
  })
  .then(() => {
    coaStore.fetchPublicationNames([...items.value!.map(({ publicationcode }) => publicationcode!)]);
  })
  .catch(() => {
    router.push('/');
  });
</script>
