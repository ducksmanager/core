<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
      <Navigation />
      <ion-searchbar v-if="showFilter" v-model="filterText" placeholder="Filter"></ion-searchbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container">
        <div v-if="hasList">
          <Row
            v-for="{ key, text } in filteredItems"
            @click="router.replace(getTargetUrlFn(route.path, key))"
            :stat="statNumerators && { numerator: statNumerators?.[key], denominator: statDenominators?.[key] }"
          >
            <template #prefix>
              <slot name="row-prefix" v-bind="{ text }"></slot>
            </template>
            <template #label>
              <slot name="row-label" v-bind="{ text }"></slot>
            </template>
            ></Row
          >
        </div>
        <div v-else>{{ t('loading_collection') }}</div>
      </div>
      <EditIssuesButton />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { coa } from '~/stores/coa';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import Navigation from '~/components/Navigation.vue';
import Row from '~/components/Row.vue';
import EditIssuesButton from '~/components/EditIssuesButton.vue';

import { computed, ref, watch } from 'vue';
import { collection } from '~/stores/collection';
import { app } from '~/stores/app';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  items: { key: string; text: string }[];
  getTargetUrlFn: (routePath: string, key: string) => string;
  statNumerators?: Record<string, number>;
  statDenominators?: Record<string, number>;
}>();

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const collectionStore = collection();
const coaStore = coa();
const appStore = app();
const filterText = ref('' as string);
const hasCoaData = ref(false);

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
  props.items.filter(({ text }) => text.toLowerCase().indexOf(filterText.value) !== -1)
);
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === 'number'
    ? t('my_collection_with_issue_count', { issueCount: collectionStore.total })
    : t('my_collection')
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
  { immediate: true }
);

watch(
  () => collectionStore.totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await coa().fetchPublicationNames(Object.keys(newValue));
    }
  },
  { immediate: true }
);

watch(
  () => appStore.currentNavigationItem,
  async (newValue) => {
    if (newValue && /^[a-z]+\/[A-Z0-9]+ /.test(newValue)) {
      router.replace('/edit-issues');
    }
  }
);
</script>

<style scoped>
#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}

ion-searchbar {
  padding: 0;
}
</style>
