<template>
  <List
    v-if="coaIssues"
    :items="sortedItems"
    :get-item-text-fn="getItemTextFn"
    item-type="issuecode"
    @items-filtered="filteredIssuenumbers = $event"
  >
    <template v-if="currentIssueViewMode.id === 'list'" #row-prefix="{ item }">
      <ion-checkbox v-if="selectedIssuecodes" :checked="selectedIssuecodes.includes(item.inducksItem.issuenumber!)"
        >&nbsp;</ion-checkbox
      >
      <Condition v-if="'condition' in item && item.condition" :value="item.condition" />
      <span v-else class="not-owned-space" />
    </template>
    <template v-if="currentIssueViewMode.id === 'list'" #row-label="{ item: { issuecode } }">
      <Issue :issuecode="issuecode" />
    </template>
    <template #row-suffix="{ item }" v-if="!isCoaView">
      <template v-if="'issueDate' in item && item.issueDate">
        <ion-icon :ios="calendarOutline" :md="calendarSharp" />&nbsp;{{ item.issueDate }}
      </template>
      <template v-if="'isToRead' in item && item.isToRead">
        &nbsp;<ion-icon style="color: green" :ios="bookmarkOutline" :md="bookmarkSharp" />
      </template>
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
              @click="issuecodes = [key]"
              :src="`${COVER_ROOT_URL}${item.cover}`"
              :alt="issuecodeDetails[item.issuecode]!.issuenumber"
            ></ion-img></ion-col></ion-row
      ></ion-grid>
    </template>
  </List>
</template>

<script setup lang="ts">
import { bookmarkOutline, bookmarkSharp, calendarOutline, calendarSharp } from 'ionicons/icons';
import type { IssueWithIssuecodeOnly } from '~dm-types/SimpleIssue';
import type { issue } from '~prisma-schemas/schemas/dm';
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

const { issues, user, purchasesById } = storeToRefs(wtdcollection());
const { publicationcode, issuecodes, isCoaView, currentIssueViewMode, selectedIssuecodes } = storeToRefs(app());
const { issuesWithTitles, issuecodeDetails } = storeToRefs(webStores.coa());
const { fetchCoverUrls, fetchIssueNumbersWithTitles } = webStores.coa();

const { bookcaseOptions, bookcaseUsername } = storeToRefs(bookcase());
const { loadBookcaseOptions, loadBookcaseOrder } = bookcase();

defineSlots<{
  rowPrefix: { item: issue };
  rowLabel: { text: string };
}>();

const getItemTextFn = (item: Item) => issuecodeDetails.value[item.issuecode]!.issuenumber;

const getIssueDate = (issue: issue) => {
  let date =
    (issue.purchaseId && purchasesById.value?.[issue.purchaseId]?.date) || (issue.creationDate as Date | string);
  return !date ? date : (typeof date === 'string' ? date : date.toISOString()).split('T')?.[0];
};

const coaIssues = computed(() => issuesWithTitles.value[publicationcode.value!]);
const coaIssuecodes = computed(() => coaIssues.value?.map(({ issuecode }) => issuecode));
const coaIssuecodeDetails = computed<typeof issuecodeDetails.value>(() =>
  Object.entries(issuecodeDetails.value)
    .filter(([issuecode]) => coaIssuecodes.value.includes(issuecode))
    .reduce((acc, [issuecode, details]) => ({ ...acc, [issuecode]: details }), {}),
);
const userIssues = computed(() =>
  (issues.value || [])
    .filter((issue) => issue.publicationcode === publicationcode.value)
    .map((issue) => ({
      ...issue,
      issueDate: getIssueDate(issue),
    })),
);

watch(isCoaView, () => {
  selectedIssuecodes.value = [];
});

type Item =
  | Pick<issue, 'issuecode' | 'condition' | 'creationDate' | 'isOnSale' | 'isToRead' | 'isSubscription'>
  | IssueWithIssuecodeOnly;

const items = computed(() =>
  coaIssues.value
    ? isCoaView.value
      ? coaIssues.value.reduce<
          {
            key: string;
            inducksItem: (typeof coaIssuecodeDetails.value)[string];
            item: Item;
          }[]
        >((acc, item) => {
          const userIssuesForThisIssue = userIssues.value.filter(
            ({ issuecode: userIssuecode }) => item.issuecode === userIssuecode,
          );

          return [
            ...acc,
            ...(userIssuesForThisIssue.length ? userIssuesForThisIssue : [item]).map((itemOrUserItem) => ({
              key: itemOrUserItem.issuecode,
              inducksItem: coaIssuecodeDetails.value[itemOrUserItem.issuecode],
              item: itemOrUserItem,
            })),
          ];
        }, [])
      : (userIssues.value || []).map((issue) => ({
          key: issue.issuecode,
          inducksItem: coaIssuecodeDetails.value[issue.issuecode],
          item: issue,
        }))
    : [],
);

const sortedItems = computed(() =>
  items.value
    .map(({ key, item }) => ({
      key,
      item,
      indexInCoaList: coaIssuecodes.value!.indexOf(item.issuecode),
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
    .map(({ key, item, isOwned, indexInCoaList, nextItemIndexIsOwned, nextItemIndexInCoaList }) => ({
      key,
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

const hasItems = computed(() => sortedItems.value.length > 0);

const sortedItemsForBookcase = computed(() =>
  sortedItems.value.map(({ item }) => ({
    ...issuecodeDetails.value[item.issuecode],
    issueCondition: (item as (typeof userIssues.value)[0]).condition,
  })),
);

const sortedItemsForCovers = shallowRef<Awaited<ReturnType<typeof getSortedItemsWithCovers>>>();

const getSortedItemsWithCovers = async () => {
  const coverUrls = (await fetchCoverUrls(publicationcode.value!)).covers;

  return sortedItems.value.map(({ key, item }) => ({
    key,
    item: {
      ...item,
      cover: coverUrls[item.issuecode]!.fullUrl,
    },
  }));
};

watch([sortedItems, currentIssueViewMode], async () => {
  if (sortedItems.value && ['covers-large', 'covers-medium', 'covers-small'].includes(currentIssueViewMode.value.id)) {
    sortedItemsForCovers.value = await getSortedItemsWithCovers();
  }
});

watch(
  [isCoaView, publicationcode],
  async () => {
    await fetchIssueNumbersWithTitles([publicationcode.value!]);
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

defineExpose({ hasItems });
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
  padding: 0 1rem;
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
