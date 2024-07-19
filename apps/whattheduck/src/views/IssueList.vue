<template>
  <List
    v-if="hasCoaData"
    :items="sortedItems"
    :get-item-text-fn="getItemTextFn"
    @items-filtered="filteredIssuenumbers = $event"
  >
    <template v-if="currentIssueViewMode.id === 'list'" #row-prefix="{ item }">
      <ion-checkbox v-if="selectedIssuenumbers" :checked="selectedIssuenumbers.includes(item.issuenumber)"
        >&nbsp;</ion-checkbox
      >
      <Condition v-if="'condition' in item && item.condition" :value="item.condition" />
      <span v-else class="not-owned-space" />
    </template>
    <template v-if="currentIssueViewMode.id === 'list'" #row-label="{ item }">
      <Issue v-bind="item" />
    </template>
    <template v-if="currentIssueViewMode.id === 'edges'">
      <Bookcase
        orientation="horizontal"
        :embedded="true"
        :currentEdgeHighlighted="null"
        :bookcaseTextures="bookcaseOptions!.textures"
        :sortedBookcase="sortedItemsForBookcase"
        ><template #edge-prefix="{ edge }"><br /><Condition :value="edge.issueCondition" /></template
      ></Bookcase>
    </template>
    <template v-if="colSize">
      <ion-grid>
        <ion-row>
          <ion-col
            v-for="{ key, item } in sortedItemsForCovers?.filter(({ key }) => filteredIssuenumbers.includes(key))"
            :key="key"
            class="ion-text-center"
            :size="String(colSize)"
            ><ion-img
              @click="currentNavigationItem = key"
              :src="`${COVER_ROOT_URL}${item.cover}`"
              :alt="item.issuenumber"
            ></ion-img></ion-col></ion-row
      ></ion-grid>
    </template>
  </List>
</template>

<script setup lang="ts">
import type { issue } from '~prisma-clients/extended/dm.extends';
import { stores as webStores, components as webComponents } from '~web';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { Bookcase } = webComponents;

const filteredIssuenumbers = ref<string[]>([]);

const COVER_ROOT_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL;

const colSize = computed(() => {
  switch (currentIssueViewMode.value.id) {
    case 'covers-small':
      return 3;
    case 'covers-medium':
      return 4;
    case 'covers-large':
      return 6;
    default:
      return undefined;
  }
});

const { issues, user } = storeToRefs(wtdcollection());
const coaStore = webStores.coa();

const { isCoaView, currentIssueViewMode, currentNavigationItem, selectedIssuenumbers } = storeToRefs(app());

const { bookcaseOptions, bookcaseUsername } = storeToRefs(bookcase());
const { loadBookcaseOptions, loadBookcaseOrder } = bookcase();

defineSlots<{
  rowPrefix: { item: issue };
  rowLabel: { text: string };
}>();

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.issuenumber;

const hasCoaData = computed(() => !!coaStore.issuesWithTitles?.[publicationcode.value]);

const publicationcode = computed(() => currentNavigationItem.value!);

const coaIssues = computed(() => coaStore.issuesWithTitles[publicationcode.value]);
const coaIssuenumbers = computed(() => coaIssues.value?.map(({ issuenumber }) => issuenumber));
const userIssues = computed(() =>
  (issues.value || []).filter((issue) => issue.publicationcode === publicationcode.value),
);

watch(isCoaView, () => {
  selectedIssuenumbers.value = [];
});

const items = computed(() =>
  coaIssues.value
    ? isCoaView.value
      ? coaIssues.value.reduce<
          {
            key: string;
            keyInList: string;
            item: (typeof userIssues.value)[number] | (typeof coaIssues.value)[number];
          }[]
        >((acc, item) => {
          const userIssuesForThisIssue = userIssues.value
            .filter(({ issuenumber: userIssueNumber }) => item.issuenumber === userIssueNumber)
            .map((item) => ({
              key: item.shortIssuecode,
              keyInList: item.issuenumber,
              item,
            }));

          return [
            ...acc,
            ...(userIssuesForThisIssue.length
              ? userIssuesForThisIssue
              : [
                  {
                    key: item.shortIssuecode,
                    keyInList: item.issuenumber,
                    item,
                  },
                ]),
          ];
        }, [])
      : (userIssues.value || []).map((issue) => ({
          key: issue.shortIssuecode,
          keyInList: issue.issuenumber,
          item: issue,
        }))
    : [],
);

const sortedItems = computed(() =>
  items.value
    .map(({ key, keyInList, item }) => ({
      key,
      keyInList,
      item,
      indexInCoaList: coaIssuenumbers.value!.indexOf(item.issuenumber),
      isOwned: (item as (typeof userIssues.value)[0]).condition !== undefined,
    }))

    .sort(({ indexInCoaList: indexInCoaList1 }, { indexInCoaList: indexInCoaList2 }) =>
      Math.sign(indexInCoaList1 - indexInCoaList2),
    )
    .map((value, idx, allItems) => ({
      ...value,
      nextItemIndexInCoaList: allItems[idx + 1]?.indexInCoaList,
      nextItemIndexIsOwned: allItems[idx + 1]?.isOwned,
    }))
    .map(({ key, keyInList, item, isOwned, indexInCoaList, nextItemIndexIsOwned, nextItemIndexInCoaList }) => ({
      key,
      keyInList,
      item,
      isOwned,
      nextItemType:
        nextItemIndexIsOwned && nextItemIndexInCoaList
          ? nextItemIndexInCoaList === indexInCoaList
            ? ('same' as const)
            : nextItemIndexInCoaList === indexInCoaList + 1
              ? ('owned' as const)
              : undefined
          : undefined,
    })),
);

const sortedItemsForBookcase = computed(() =>
  sortedItems.value.map(({ item }) => ({
    publicationcode: item.publicationcode!,
    issuenumber: item.issuenumber,
    issueCondition: (item as (typeof userIssues.value)[0]).condition,
  })),
);

const sortedItemsForCovers = shallowRef<Awaited<ReturnType<typeof getSortedItemsWithCovers>>>();

const getSortedItemsWithCovers = async () => {
  const coverUrls = (await coaStore.fetchCoverUrls(publicationcode.value)).covers;

  return sortedItems.value.map(({ key, item }) => ({
    key,
    item: {
      ...item,
      cover: coverUrls[item.issuenumber]!.fullUrl,
    },
  }));
};

watch([sortedItems, currentIssueViewMode], async () => {
  if (sortedItems.value && ['covers-large', 'covers-medium', 'covers-small'].includes(currentIssueViewMode.value.id)) {
    sortedItemsForCovers.value = await getSortedItemsWithCovers();
  }
});

watch(
  [isCoaView, currentNavigationItem],
  async () => {
    await coaStore.fetchIssueNumbersWithTitles([publicationcode.value]);
  },
  { immediate: true },
);

watch(
  user,
  () => {
    if (user.value) {
      bookcaseUsername.value = user.value!.username;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await loadBookcaseOptions();
  await loadBookcaseOrder();
});
</script>

<style lang="scss" scoped>
@import '../theme/variables.scss';

:deep(ion-content) {
  margin-bottom: 60px !important;
}

ion-checkbox {
  flex-grow: 0;
  margin-right: 0.5rem;
  width: auto;
}

.not-owned-space {
  display: inline-block;

  width: calc(14px + 8px /* margin-right */);
  height: 14px;
}

:deep(.bookcase) {
  overflow: auto;
}

:deep(.edge) {
  display: inline-block;
}

:deep(.item-wrapper) {
  &:has(> .is-owned.is-next-item-owned),
  &:has(> .is-owned.is-next-item-same) {
    .dm-condition-background::after,
    + .item-wrapper .dm-condition-background::before {
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

    + .item-wrapper {
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

  &:has(> .is-owned.is-next-item-same) {
    .dm-condition-background::after,
    + .item-wrapper .dm-condition-background::before {
      width: 14px;
      margin-left: 0;
    }
  }
}

ion-modal {
  width: 100%;
  --height: auto;
}

ion-range {
  padding: 0 8px;
}

ion-checkbox {
  pointer-events: none;
}
</style>
