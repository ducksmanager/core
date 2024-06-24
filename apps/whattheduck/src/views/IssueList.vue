<template>
  <List
    v-if="hasCoaData"
    :items="sortedItems"
    :get-item-text-fn="getItemTextFn"
    @items-filtered="filteredIssuenumbers = $event"
    @load="emit('load', $event)"
  >
    <template v-if="currentIssueViewMode.id === 'list'" #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaView">&nbsp;</ion-checkbox>
      <Condition v-if="item.condition" :value="item.condition" />
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
              @click="showIssueToast(item)"
              :src="`${COVER_ROOT_URL}${item.cover}`"
              :alt="item.issuenumber"
            ></ion-img></ion-col></ion-row
      ></ion-grid>
    </template>
  </List>
</template>

<script setup lang="ts">
import { toastController } from '@ionic/vue';
import type { issue } from '~prisma-clients/extended/dm.extends';
import { stores as webStores, components as webComponents } from '~web';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { Bookcase } = webComponents;

const filteredIssuenumbers = ref<string[]>([]);

const COVER_ROOT_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL;

const emit = defineEmits<(e: 'load', hasItems: boolean) => void>();

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

const { isCoaView, currentIssueViewMode, currentNavigationItem } = storeToRefs(app());

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

const items = computed(() =>
  coaIssues.value
    ? isCoaView.value
      ? coaIssues.value.map(({ issuecode, issuenumber }) => ({
          key: issuecode,
          item: {
            issuenumber,
            ...(userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber) || {}),
          },
        }))
      : (issues.value || [])
          .filter((issue) => issue.publicationcode === publicationcode.value)
          .map(({ publicationcode, issuenumber, ...issue }) => ({
            key: `${publicationcode} ${issuenumber}`,
            item: { ...issue, publicationcode, issuenumber }!,
          }))
    : [],
);

const sortedItems = computed(() =>
  items.value
    .map(({ key, item }) => ({
      key,
      item,
      indexInCoaList: coaIssuenumbers.value!.indexOf(item.issuenumber),
    }))

    .sort(({ indexInCoaList: indexInCoaList1 }, { indexInCoaList: indexInCoaList2 }) =>
      Math.sign(indexInCoaList1 - indexInCoaList2),
    )
    .map(({ key, item, indexInCoaList }, idx, allItems) => {
      const nextItemIndexInCoaList = allItems[idx + 1]?.indexInCoaList;
      return {
        key,
        item,
        isOwned: item.condition !== undefined,
        nextItemType: nextItemIndexInCoaList
          ? nextItemIndexInCoaList === indexInCoaList
            ? ('same' as const)
            : nextItemIndexInCoaList === indexInCoaList + 1
              ? ('owned' as const)
              : undefined
          : undefined,
      };
    }),
);

const sortedItemsForBookcase = computed(() =>
  sortedItems.value.map(({ item }) => ({
    publicationcode: item.publicationcode!,
    issuenumber: item.issuenumber,
    issueCondition: item.condition,
  })),
);

const showIssueToast = async (item: (typeof items)['value'][0]['item']) => {
  const toast = await toastController.create({
    message: item.issuenumber,
    translucent: true,
    duration: 1000,
  });
  toast.present();
};

const sortedItemsForCovers = ref<Awaited<ReturnType<typeof getSortedItemsWithCovers>>>();

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

watch(
  sortedItems,
  () => {
    emit('load', sortedItems.value.length > 0);
  },
  { immediate: true },
);

watch([sortedItems, currentIssueViewMode], async () => {
  if (sortedItems.value && ['covers-large', 'covers-medium', 'covers-small'].includes(currentIssueViewMode.value.id)) {
    sortedItemsForCovers.value = await getSortedItemsWithCovers();
  }
});

onMounted(async () => {
  await coaStore.fetchIssueNumbersWithTitles([publicationcode.value]);
  bookcaseUsername.value = user.value!.username;

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

:deep(ion-item) {
  &.is-owned.next-item-owned,
  &.is-owned.next-item-same {
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

  &.is-owned.next-item-same {
    .dm-condition-background::after,
    + ion-item .dm-condition-background::before {
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
</style>
