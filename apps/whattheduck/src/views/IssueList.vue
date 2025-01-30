<template>
  <List
    v-if="sortedItems"
    :items="sortedItems"
    :get-item-text-fn="getItemTextFn"
    item-type="issuecode"
    @items-filtered="filteredIssuenumbers = $event"
  >
    <template v-if="currentIssueViewMode.id === 'list'" #row-prefix="{ item }">
      <ion-checkbox v-if="selectedIssuecodes" :checked="selectedIssuecodes.includes(item.issuecode)"
        >&nbsp;</ion-checkbox
      >
      <Condition v-if="'condition' in item && item.condition" :value="item.condition" />
      <span v-else class="not-owned-space" />
    </template>
    <template v-if="currentIssueViewMode.id === 'list'" #row-label="{ item: { issuecode } }">
      <Issue :issuecode="issuecode" />
    </template>
    <template v-if="!isCoaView" #row-suffix="{ item }">
      <template v-if="'issueDate' in item && item.issueDate">
        <ion-icon :ios="calendarOutline" :md="calendarSharp" />&nbsp;{{ item.issueDate }}
      </template>
      <template v-if="'isToRead' in item && item.isToRead">
        &nbsp;<ion-icon style="color: green" :ios="bookmarkOutline" :md="bookmarkSharp" />
      </template>
    </template>
    <template v-if="currentIssueViewMode.id === 'edges' && sortedItemsForBookcase">
      <Bookcase
        orientation="horizontal"
        :embedded="true"
        :current-edge-highlighted="null"
        :bookcase-textures="bookcaseOptions!.textures"
        :sorted-bookcase="sortedItemsForBookcase"
      />
    </template>
    <template v-if="colSize">
      <ion-grid>
        <ion-row>
          <ion-col
            v-for="{ key, item } in sortedItemsForCovers?.filter(({ key }) => filteredIssuenumbers.includes(key))"
            :key="key"
            class="ion-text-center"
            :size="String(colSize)"
            @click="currentNavigationItem = { type: 'issuecodes', value: [key] }"
            ><ion-img
              v-if="item.cover"
              :src="`${COVER_ROOT_URL}${item.cover}`"
              :alt="issuecodeDetails[item.issuecode]!.issuenumber"
              @error="item.cover = null"
            ></ion-img
            ><ion-text v-else
              >{{ issuecodeDetails[item.issuecode]!.issuenumber }}<br />{{ $t('(pas de couverture)') }}</ion-text
            ></ion-col
          ></ion-row
        ></ion-grid
      >
    </template>
  </List>
</template>

<script setup lang="ts">
import { bookmarkOutline, bookmarkSharp, calendarOutline, calendarSharp } from 'ionicons/icons';
import type { IssueWithIssuecodeOnly } from '~dm-types/IssueWithIssuecodeOnly';
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
const { publicationcode, currentNavigationItem, isCoaView, currentIssueViewMode, selectedIssuecodes, currentFilter } =
  storeToRefs(app());
const { issuecodeDetails, issuecodesByPublicationcode } = storeToRefs(webStores.coa());
const { fetchCoverUrls, fetchIssuecodesByPublicationcode, fetchIssuecodeDetails } = webStores.coa();

const { bookcaseOptions, bookcaseUsername } = storeToRefs(bookcase());
const { loadBookcaseOptions, loadBookcaseOrder } = bookcase();

const { isOfflineMode } = storeToRefs(app());

defineSlots<{
  rowPrefix: { item: issue };
  rowLabel: { text: string };
}>();

const hasData = ref(false);

const getItemTextFn = (item: Item) => issuecodeDetails.value[item.issuecode]!.issuenumber;

const getIssueDate = (issue: issue) => {
  let date =
    (issue.purchaseId && purchasesById.value?.[issue.purchaseId]?.date) || (issue.creationDate as Date | string);
  return !date ? date : (typeof date === 'string' ? date : date.toISOString()).split('T')?.[0];
};

const coaIssuecodes = computed(() =>
  !isOfflineMode.value
    ? issuecodesByPublicationcode.value[publicationcode.value!]?.map(({ issuecode }) => issuecode)
    : issues.value!.filter((issue) => issue.publicationcode === publicationcode.value).map((issue) => issue.issuecode),
);
const userIssues = computed(() =>
  (issues.value || [])
    .filter((issue) => issue.publicationcode === publicationcode.value)
    .filter(
      currentFilter.value.id === 'all'
        ? () => true
        : ({ isToRead }) => isToRead === (currentFilter.value.id === 'unreadBooksOnly'),
    )
    .map((issue) => {
      (issue as typeof issue & { issueDate: string }).issueDate = getIssueDate(issue);
      return issue;
    }),
);

watch(isCoaView, () => {
  selectedIssuecodes.value = [];
});

type Item =
  | (Pick<issue, 'condition' | 'creationDate' | 'isOnSale' | 'isToRead' | 'isSubscription'> & { issuecode: string })
  | IssueWithIssuecodeOnly;

const items = computed(() => {
  if (!hasData.value) {
    return undefined;
  }

  if (isCoaView.value) {
    return coaIssuecodes.value.reduce<{ key: string; item: Item }[]>((acc, issuecode) => {
      const userIssuesForThisIssue = userIssues.value.filter(
        ({ issuecode: userIssuecode }) => issuecode === userIssuecode,
      );

      const itemsToAdd = userIssuesForThisIssue.length ? userIssuesForThisIssue : [issuecodeDetails.value[issuecode]];

      for (const itemOrUserItem of itemsToAdd) {
        acc.push({
          key: issuecode,
          item: itemOrUserItem,
        });
      }

      return acc;
    }, []);
  } else {
    return (userIssues.value || []).map((issue) => ({
      key: issue.issuecode,
      item: issue,
    }));
  }
});

const sortedItems = computed(
  () =>
    coaIssuecodes.value &&
    items.value
      ?.map(({ key, item }) => ({
        key,
        item,
        indexInCoaList: coaIssuecodes.value.indexOf(item.issuecode),
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

const hasItems = computed(() => sortedItems.value?.length);

const sortedItemsForBookcase = computed(() =>
  sortedItems.value?.map(({ item }) => ({
    ...issuecodeDetails.value[item.issuecode],
    issueCondition: (item as (typeof userIssues.value)[0]).condition,
  })),
);

const sortedItemsForCovers = shallowRef<Awaited<ReturnType<typeof getSortedItemsWithCovers>>>();

const getSortedItemsWithCovers = async () => {
  const coverUrls = (await fetchCoverUrls(publicationcode.value!)).covers;

  return sortedItems.value?.map(({ key, item }) => ({
    key,
    item: {
      ...item,
      cover: coverUrls[item.issuecode]!.fullUrl,
    },
  }));
};

watch(
  [sortedItems, currentIssueViewMode],
  async () => {
    if (
      sortedItems.value &&
      ['covers-large', 'covers-medium', 'covers-small'].includes(currentIssueViewMode.value.id)
    ) {
      sortedItemsForCovers.value = await getSortedItemsWithCovers();
    }
  },
  { immediate: true },
);

watch(
  [isCoaView, publicationcode, isOfflineMode],
  async () => {
    if (isOfflineMode.value === false) {
      await fetchIssuecodesByPublicationcode([publicationcode.value!]);
      await fetchIssuecodeDetails(coaIssuecodes.value);
      hasData.value = true;
    } else {
      hasData.value = true;
    }
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

ion-col {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
