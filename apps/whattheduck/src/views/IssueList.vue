<template>
  <List
    v-if="hasCoaData"
    :items="sortedItems"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
    :view-modes="viewModes"
  >
    <template v-if="issueViewMode === 'list'" #row-prefix="{ item }">
      <ion-checkbox v-if="isCoaView">&nbsp;</ion-checkbox>
      <Condition v-if="item.condition" :value="item.condition" />
      <span v-else class="not-owned-space" />
    </template>
    <template v-if="issueViewMode === 'list'" #row-label="{ item }">
      <Issue v-bind="item" />
    </template>
    <template v-if="issueViewMode === 'edges'">
      <Bookcase
        orientation="horizontal"
        :embedded="true"
        :currentEdgeHighlighted="null"
        :bookcaseTextures="bookcaseOptions!.textures"
        :sortedBookcase="sortedItemsForBookcase"
      />
    </template>
    <!-- <template v-if="issueViewMode === 'edges'" #row-label="{ item }">
      <EdgeContents
        src="https://res.cloudinary.com/dl7hskxab/image/upload/t_rotate/v1523605655/edges-fr-MP-1.png"
        :sprite-path="null"
        :id="String(Math.random())"
        :publicationcode="item.publicationcode!"
        :issuenumber="item.issuenumber"
        orientation="horizontal"
      />
    </template> -->
    <template #sheet-modal>
      <ion-modal
        ref="modalRef"
        handle-behavior="cycle"
        class="ion-padding"
        :initial-breakpoint="0.4"
        :is-open="true"
        :backdrop-dismiss="true"
        :can-dismiss="true"
        :breakpoints="[0.4, 1]"
        :backdrop-breakpoint="0.4"
        @ion-modal-did-dismiss="modalRef!.$el.present()"
        ><ion-row class="ion-text-center ion-padding"><ion-title>Zoom</ion-title></ion-row>
        <ion-row>
          <ion-range
            ref="zoomRange"
            :value="viewModeIds.indexOf(issueViewMode)"
            @ionChange="issueViewMode = viewModeIds[$event.detail.value as number]"
            aria-label="Range with ticks"
            :ticks="true"
            :snaps="true"
            :min="0"
            :max="viewModeIds.length - 1"
          ></ion-range></ion-row
        ><ion-row class="ion-justify-content-between">
          <ion-icon :ios="listOutline" :md="listSharp" /></ion-row></ion-modal
    ></template>
  </List>
</template>

<script setup lang="ts">
import type { issueWithPublicationcode } from '~prisma-clients/extended/dm.extends';
import { stores as webStores } from '~web';
import { listOutline, listSharp } from 'ionicons/icons';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

import { components as webComponents } from '~web';
const { Bookcase } = webComponents;

const route = useRoute();

const { issues, user } = storeToRefs(wtdcollection());
const coaStore = webStores.coa();

const { viewModeIds } = app();
const viewModes = [
  { label: 'List', icon: { ios: listOutline, md: listSharp } },
  { label: 'Edges', icon: { ios: listOutline, md: listSharp } },
  { label: 'Covers (small)', icon: { ios: listOutline, md: listSharp } },
  { label: 'Covers (medium)', icon: { ios: listOutline, md: listSharp } },
  { label: 'Covers (large)', icon: { ios: listOutline, md: listSharp } },
];
const { isCoaView, issueViewMode } = storeToRefs(app());

const { bookcaseOptions, bookcaseUsername } = storeToRefs(bookcase());
const { loadBookcaseOptions, loadBookcaseOrder } = bookcase();

const modalRef = ref<{ $el: HTMLIonModalElement }>();

defineSlots<{
  rowPrefix: { item: issueWithPublicationcode };
  rowLabel: { text: string };
}>();

const zoomRange = ref<{ $el: HTMLIonRangeElement }>();

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
          key: `${publicationcode.value} ${issuenumber}`,
          item: {
            issuenumber,
            ...(userIssues.value.find(({ issuenumber: userIssueNumber }) => issuenumber === userIssueNumber) || {}),
          },
        }))
      : (issues.value || [])
          .filter((issue) => issue.publicationcode === publicationcode.value)
          .map(({ issuenumber, ...issue }) => ({
            key: `${publicationcode.value} ${issuenumber}`,
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
