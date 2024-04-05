<template>
  <ion-page id="main-content">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
      <template v-if="items?.length">
        <Navigation />
        <ion-searchbar autocapitalize="sentences" v-if="showFilter" v-model="filterText" placeholder="Filter"
      /></template>
    </ion-header>

    <ion-content v-if="!items" ref="content">
      {{ t('Chargement de votre collection…') }}
    </ion-content>
    <ion-content v-else-if="!items.length" ref="content">
      {{ t('Votre collection est vide.') }}
    </ion-content>
    <ion-content
      v-else
      ref="content"
      class="no-padding"
      scroll-events
      @ion-scroll="onScroll"
      @ion-scroll-end="isScrolling = false"
    >
      <Row
        v-for="{ key, item, ownsNext } in filteredItems"
        :fill-percentage="fillPercentages?.[key]?.ownershipPercentage || 0"
        :is-next-owned="ownsNext"
        @click="onRowClick(key)"
      >
        <template #prefix v-if="item">
          <slot name="row-prefix" :item="item" />
        </template>
        <template #label>
          <slot name="row-label" :item="item" />
        </template>
        <template #suffix>
          <slot name="row-suffix" :item="item" />
        </template>
      </Row>
      <EditIssuesButton />

      <div
        v-show="isScrolling"
        v-if="itemInCenterOfViewport"
        id="scroll-text"
        slot="fixed"
        :style="{ top: scrollPositionPct + '%' }"
      >
        {{ getItemTextFn(itemInCenterOfViewport) }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts" generic="Item extends Required<any>">
import { IonContent, ScrollDetail } from '@ionic/vue';

import type { OwnershipWithPercentage } from '~/composables/useOwnership';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

defineSlots<{
  'row-prefix'(props: { item: Item }): any;
  'row-label'(props: { item: Item }): any;
  'row-suffix'(props: { item: Item }): any;
}>();

const props = defineProps<{
  items: { key: string; item: Item; ownsNext?: boolean }[];
  getTargetRouteFn: (key: string) => Pick<RouteLocationNamedRaw, 'name' | 'params'>;
  getItemTextFn: (item: Item) => string;
  fillPercentages?: Record<string, OwnershipWithPercentage>;
}>();

const content = ref<InstanceType<typeof IonContent> | null>(null);

const scrollPositionPct = ref<number>(0);
const isScrolling = ref(false);

const onScroll = (e: CustomEvent<ScrollDetail>) => {
  const scrollTop = e.detail.scrollTop;
  isScrolling.value = e.detail.isScrolling;
  const innerScrollElement = content.value!.$el.shadowRoot.querySelector('.inner-scroll');
  const scrollHeight = innerScrollElement.scrollHeight;
  const clientHeight = innerScrollElement.clientHeight;

  const middleOfViewport = scrollTop + clientHeight / 2;

  scrollPositionPct.value = (middleOfViewport / scrollHeight) * 100;
};

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const collectionStore = wtdcollection();
const appStore = app();
const filterText = ref('' as string);

const itemInCenterOfViewport = computed(() => {
  if (!props.items.length) {
    return undefined;
  }
  const itemIndex = Math.floor((scrollPositionPct.value * props.items.length) / 100);
  return props.items[itemIndex].item;
});

const onRowClick = (key: string) => {
  router.push({ ...props.getTargetRouteFn(key), query: { coa: route.query.coa } });
};

const filteredItems = computed(() =>
  props.items.filter(({ item }) => props.getItemTextFn(item).toLowerCase().indexOf(filterText.value) !== -1),
);
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === 'number'
    ? t('Ma collection ({issueCount} numéros)', { issueCount: collectionStore.total })
    : t('Ma collection'),
);

watch(
  () => appStore.currentNavigationItem,
  async (newValue) => {
    if (newValue && /^[a-z]+\/[A-Z0-9]+ /.test(newValue)) {
      router.push('/edit-issues');
    }
  },
);
</script>

<style scoped>
::v-deep(ion-content img) {
  margin-right: 1rem;
}
strong {
  font-size: 20px;
  line-height: 26px;
}

p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

a {
  text-decoration: none;
}

ion-searchbar {
  padding: 0;
}

#scroll-text {
  position: absolute;
  right: 20px;
  padding: 1rem;
  color: black;
  background: white;
  z-index: 1000;
}
</style>
