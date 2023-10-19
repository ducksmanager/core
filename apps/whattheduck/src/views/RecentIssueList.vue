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
import type { GET__coa__list__issues__recent } from '~api-routes';
import { stores as webStores } from '~web';

import useCondition from '~/composables/useCondition';
import type { Issue } from '~/persistence/models/dm/Issue';
import { wtdcollection } from '~/stores/wtdcollection';

const router = useRouter();

const collectionStore = wtdcollection();
const coaStore = webStores.coa();

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
  params: key.match(coaStore.ISSUECODE_REGEX)!.groups,
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
