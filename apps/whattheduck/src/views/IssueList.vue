<template>
  <List
    v-if="hasCoaData"
    :items="sortedItems"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
    @items-filtered="filteredIssuenumbers = $event"
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
      />
    </template>
    <template v-if="['covers-small', 'covers-medium', 'covers-large'].includes(currentIssueViewMode.id)">
      <ion-grid>
        <ion-row>
          <ion-col
            v-for="{ key, item } in sortedItemsForCovers?.filter(({ item }) =>
              filteredIssuenumbers.includes(item.issuenumber),
            )"
            :key="key"
            class="ion-text-center"
            :size="
              currentIssueViewMode.id === 'covers-small' ? '3' : currentIssueViewMode.id === 'covers-medium' ? '4' : '6'
            "
            ><ion-img
              @click="showIssueToast(item)"
              :src="`${COVER_ROOT_URL}${item.cover}`"
              :alt="item.issuenumber"
            ></ion-img></ion-col></ion-row
      ></ion-grid>
    </template>
    <template #page-menu><ViewModesButton /></template>
  </List>
</template>

<script setup lang="ts">
import type { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';
import { stores as webStores } from '~web';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

import { components as webComponents } from '~web';
import { toastController } from '@ionic/vue';
const { Bookcase } = webComponents;

const filteredIssuenumbers = ref<string[]>([]);

const COVER_ROOT_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL;

const route = useRoute();

const { issues, user } = storeToRefs(wtdcollection());
const coaStore = webStores.coa();
const {} = storeToRefs(webStores.coa());

const { isCoaView, currentIssueViewMode } = storeToRefs(app());

const { bookcaseOptions, bookcaseUsername } = storeToRefs(bookcase());
const { loadBookcaseOptions, loadBookcaseOrder } = bookcase();

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

const publicationcode = computed(() => `${route.params.publicationcode}`);

const coaIssues = computed(() => coaStore.issuesWithTitles[publicationcode.value]);
const coaIssuenumbers = computed(() => coaIssues.value?.map(({ issuenumber }) => issuenumber));
const userIssues = computed(() =>
  (issues.value || []).filter((issue) => issue.publicationcode === publicationcode.value),
);

const items = computed(() =>
  coaIssues.value
    ? isCoaView.value
      ? coaIssues.value.map(({ issuenumber }) => ({
          key: issuenumber,
          item: {
            issuenumber,
            ...(userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber) || {}),
          },
        }))
      : (issues.value || [])
          .filter((issue) => issue.publicationcode === publicationcode.value)
          .map(({ issuenumber, ...issue }) => ({
            key: issuenumber,
            item: { ...issue, issuenumber }!,
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
    .map(({ key, item, indexInCoaList }, idx, allItems) => ({
      key,
      item,
      isOwned: item.condition !== undefined,
      isNextOwned:
        allItems[idx + 1]?.indexInCoaList === indexInCoaList + 1 && allItems[idx + 1]?.item?.condition !== undefined,
    })),
);

const sortedItemsForBookcase = computed(() =>
  sortedItems.value.map(({ item }) => ({ publicationcode: item.publicationcode!, issuenumber: item.issuenumber })),
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

ion-modal {
  width: 100%;
  --height: auto;
}

ion-range {
  padding: 0 8px;
}
</style>
