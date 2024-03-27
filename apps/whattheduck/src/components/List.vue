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
    <ion-content v-else ref="content" class="no-padding">
      <Row
        v-for="{ key, item, ownsNext } in filteredItems"
        :fill-percentage="fillPercentages?.[key]?.ownershipPercentage ||0"
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
const scrollPosition = ref<number>(0);

watch(
  () => content.value,
  async (newValue) => {
    if (newValue) {
      const scrollElement = await newValue.$el.getScrollElement()!;
      setInterval(() => {
        scrollPosition.value =
          (100 * scrollElement.scrollTop) / (scrollElement.scrollHeight - scrollElement.clientHeight);
      }, 100);
    }
  },
  { immediate: true },
);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const collectionStore = wtdcollection();
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

// const hasList = computed((): boolean => {
//   if (!hasCoaData.value) {
//     return false;
//   }
//   switch (itemType.value) {
//     case 'Country':
//       return !!collectionStore.ownedCountries;
//     case 'Publication':
//       return !!collectionStore.ownedPublications /* &&
//           collectionStore.ownedPublications.filter((publicationCode) =>
//             Object.keys(coaStore.publicationNames).includes(publicationCode)
//           ).length === collectionStore.ownedPublications.length
//         )*/;
//     case 'Issue':
//       return !!collectionStore.issues && !!coaStore.issueNumbers[appStore.currentNavigationItem || ''];
//   }
// });

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
    ? t('Ma collection ({issueCount} numéros)', { issueCount: collectionStore.total })
    : t('Ma collection'),
);

// const ownershipAllItems = computed(() => {
//   switch (itemType.value) {
//     case 'Country':
//       return [collectionStore.totalPerCountry, coaStore.issueCountsPerCountry!];
//     case 'Publication':
//       return [collectionStore.totalPerPublication, coaStore.issueCounts!];
//   }
// });

// const ownership = computed(() =>
//   !ownershipAllItems.value?.length
//     ? undefined
//     : Object.entries(ownershipAllItems.value![0]!)
//         .map(([key, owned]) => ({ key, owned: owned as number, total: ownershipAllItems.value![1]![key] as number }))
//         .reduce<Record<string, [number, number]>>(
//           (acc, { key, owned, total }) => ({ ...acc, [key]: [owned, total] }),
//           {},
//         ),
// );

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


watch(() => route.query, (newId, oldId) => {
  debugger
}, {deep: true})
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
