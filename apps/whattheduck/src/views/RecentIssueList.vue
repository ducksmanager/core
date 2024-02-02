<template>
  <List v-if="hasData" :items="sortedItems" :get-target-route-fn="getTargetUrlFn" :get-item-text-fn="getItemTextFn">
    <template #row-prefix="{ item }">
      <Condition v-if="item.owned" :value="getConditionText(item.owned.condition)" />
    </template>
    <template #row-label="{ item }">
      {{ coaStore.publicationNames[item.publicationcode!] }} {{ item.issuenumber }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores as webStores } from '~web';

import { getConditionText } from '~/composables/useCondition';
import type { Issue } from '~/persistence/models/dm/Issue';
import { wtdcollection } from '~/stores/wtdcollection';
import { EventReturnType } from '~services/types';
import CoaServices from '~services/coa/types';

const router = useRouter();

const collectionStore = wtdcollection();
const coaStore = webStores.coa();

type Item = EventReturnType<CoaServices['getRecentIssues']>[0] & { owned?: Issue };

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
