<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
      <Navigation />
      <ion-searchbar v-if="showFilter" v-model="filterText" placeholder="Filter" />
    </ion-header>

    <ion-content v-if="!filteredItems" ref="content">
      {{ t('loading_collection') }}
    </ion-content>
    <ion-content v-else ref="content" class="no-padding">
      <Row
        v-for="{ key, item, ownsNext } in filteredItems"
        :ownership-text-fn="ownershipTextFn"
        :ownership="ownership?.[key]"
        :is-next-owned="ownsNext"
        @click="onRowClick(key)"
      >
        <template #prefix v-if="item">
          <slot name="row-prefix" :item="item" />
        </template>
        <template #label>
          <slot name="row-label" :item="item" :key="key" />
        </template>
      </Row>
      <EditIssuesButton />

      <div
        v-show="scrollPosition"
        v-if="itemInCenterOfViewport"
        id="scroll-text"
        slot="fixed"
        :style="{ top: scrollPosition + '%' }"
      >
        {{ getItemTextFn(itemInCenterOfViewport) }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts" generic="Item extends Required<any>">
import { IonContent } from '@ionic/vue';
import { stores } from '~web';

import { app } from '~/stores/app';
import { collection } from '~/stores/collection';

defineSlots<{
  'row-prefix'(props: { item: Item }): any;
  'row-label'(props: { item: Item; key: string }): any;
}>();

const props = defineProps<{
  items: { key: string; item: Item; ownsNext?: boolean }[];
  getTargetRouteFn: (key: string) => Pick<RouteLocationNamedRaw, 'name' | 'params'>;
  getItemTextFn: (item: Item) => string;
  statNumerators?: Record<string, number>;
  statDenominators?: Record<string, number>;
  ownershipTextFn: (ownership: [number, number], fillPercentage?: number | undefined) => string;
}>();

const content = ref<InstanceType<typeof IonContent> | null>(null);
const scrollTop = ref<number>(0);
const scrollPosition = ref<number>(0);

watch(
  () => content.value,
  async (newValue) => {
    if (newValue) {
      const scrollElement = await newValue?.$el.getScrollElement()!;
      setInterval(() => {
        scrollTop.value = scrollElement.scrollTop;
        scrollPosition.value = (100 * scrollTop.value) / (scrollElement.scrollHeight - scrollElement.clientHeight);
      }, 100);
    }
  },
  { immediate: true },
);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const collectionStore = collection();
const coaStore = stores.coa();
const appStore = app();
const filterText = ref('' as string);
const hasCoaData = ref(false);

const itemInCenterOfViewport = computed(() => {
  if (!props.items.length || !scrollPosition.value) {
    return undefined;
  }
  const itemIndex = Math.floor((scrollPosition.value * props.items.length) / 100);
  return props.items[itemIndex].item;
});

const onRowClick = (key: string) => {
  router.push({ ...props.getTargetRouteFn(key), query: { coa: route.query.coa } });
};

const hasList = computed((): boolean => {
  if (!hasCoaData.value) {
    return false;
  }
  switch (itemType.value) {
    case 'Country':
      return !!collectionStore.ownedCountries;
    case 'Publication':
      return !!collectionStore.ownedPublications /* &&
          collectionStore.ownedPublications.filter((publicationCode) =>
            Object.keys(coaStore.publicationNames).includes(publicationCode)
          ).length === collectionStore.ownedPublications.length
        )*/;
    case 'Issue':
      return !!collectionStore.collection && !!coaStore.issueNumbers[appStore.currentNavigationItem || ''];
  }
});

const itemType = computed(() => {
  switch (appStore.currentNavigationItem?.indexOf('/')) {
    case undefined:
      return 'Country';
    case -1:
      return 'Publication';
    default:
      return 'Issue';
  }
});

const filteredItems = computed(() =>
  props.items.filter(({ item }) => props.getItemTextFn(item).toLowerCase().indexOf(filterText.value) !== -1),
);
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === 'number'
    ? t('my_collection_with_issue_count', { issueCount: collectionStore.total })
    : t('my_collection'),
);

const ownershipAllItems = computed(() => {
  switch (itemType.value) {
    case 'Country':
      return [collectionStore.totalPerCountry, coaStore.issueCountsPerCountry!];
    case 'Publication':
      return [collectionStore.totalPerPublication, coaStore.issueCounts!];
  }
});

const ownership = computed(() =>
  !ownershipAllItems.value?.length
    ? undefined
    : Object.entries(ownershipAllItems.value![0]!)
        .map(([key, owned]) => ({ key, owned: owned as number, total: ownershipAllItems.value![1]![key] as number }))
        .reduce<Record<string, [number, number]>>(
          (acc, { key, owned, total }) => ({ ...acc, [key]: [owned, total] }),
          {},
        ),
);

watch(
  () => itemType.value,
  async (newValue) => {
    hasCoaData.value = false;
    await coaStore.fetchIssueCounts();
    switch (newValue) {
      case 'Country':
        await coaStore.fetchCountryNames();
        break;
      case 'Publication':
        await coaStore.fetchPublicationNames([appStore.currentNavigationItem || '']);
        break;
      case 'Issue':
        await coaStore.fetchIssueNumbers([appStore.currentNavigationItem || '']);
        break;
    }
    hasCoaData.value = true;
  },
  { immediate: true },
);

watch(
  () => collectionStore.totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await coaStore.fetchPublicationNames(Object.keys(newValue));
    }
  },
  { immediate: true },
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
