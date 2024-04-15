<template>
  <List v-if="hasCoaData" :items="sortedItems" :get-target-route-fn="getTargetUrlFn" :get-item-text-fn="getItemTextFn">
    <template #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaView">&nbsp;</ion-checkbox>
      <Condition v-if="item.condition" :value="item.condition" />
      <span v-else class="not-owned-space" />
    </template>
    <template #row-label="{ item }">
      <Issue v-bind="item" />
    </template>
  </List>
</template>

<script setup lang="ts">
import type { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';
import { stores as webStores } from '~web';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const route = useRoute();

const collectionStore = wtdcollection();
const coaStore = webStores.coa();
const { isCoaView, currentNavigationItem } = storeToRefs(app());

defineSlots<{
  rowPrefix: { item: issueWithPublicationcode };
  rowLabel: { text: string };
}>();

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.issuenumber;

const hasCoaData = computed(() => !!coaStore.issuesWithTitles?.[publicationcode.value]);

const getTargetUrlFn = (key: string) => ({
  name: 'OwnedIssueCopiesModal',
  params: key.match(coaStore.ISSUECODE_REGEX)!.groups,
});

const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);

watch(
  publicationcode,
  async (newValue) => {
    currentNavigationItem.value = newValue as string;
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
    ? isCoaView.value
      ? coaIssues.value.map(({ issuenumber }) => ({
          key: `${publicationcode.value} ${issuenumber}`,
          item: {
            issuenumber,
            ...(userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber) || {}),
          },
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
    .map(({ key, item }) => ({
      key,
      item,
      indexInCoaList: coaIssuenumbers.value!.indexOf(item.issuenumber),
    }))

    .sort(({ indexInCoaList: indexInCoaList1 }, { indexInCoaList: indexInCoaList2 }) =>
      Math.sign(indexInCoaList1 - indexInCoaList2),
    )
    .map(({ key, item }, idx, allItems) => ({
      key,
      item,
      isOwned: item.condition !== undefined,
      isNextOwned: allItems[idx + 1]?.item?.condition !== undefined,
    })),
);

onMounted(async () => {
  await coaStore.fetchIssueNumbersWithTitles([publicationcode.value]);
});
</script>

<style lang="scss" scoped>
@import '../theme/variables.scss';

ion-checkbox {
  margin-right: 0.5rem;
  width: auto;
}

.not-owned-space {
  display: inline-block;

  width: 14px;
  height: 14px;
}

:deep(ion-item) {
  &.is-owned.is-next-owned {
    .dm-condition-background::after,
    + ion-item .dm-condition-background::before {
      position: absolute;
      width: 2px;
      margin-left: 6px;
      height: 50%;
      content: ' ';
    }

    .dm-condition-background {
      @each $condition, $conditionColor in $dmConditions {
        &.#{$condition}::after {
          background: $conditionColor;
        }
      }
      &::after {
        bottom: 0;
      }
    }

    + ion-item {
      .dm-condition-background {
        @each $condition, $conditionColor in $dmConditions {
          &.#{$condition}::before {
            background: $conditionColor;
          }
        }
        &::before {
          top: 0;
        }
      }
    }
  }
}
</style>
