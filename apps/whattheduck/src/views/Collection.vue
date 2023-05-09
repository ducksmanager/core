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
          <Row v-for="{ text, key } in filteredItems" @click="appStore.currentNavigationItem = key">
            <template #label>
              <Country v-if="itemType === 'Country'" :value="text" />
              <Publication v-else-if="itemType === 'Publication'" :value="text" />
              <Issue v-else-if="itemType === 'Issue'" :value="key" />
            </template>
            <template #stats>
              <template v-if="itemType === 'Country'"
                >{{ totalPerCountry[key] }} / {{ issueCountsPerCountry![key] }}</template
              >
              <template v-else-if="itemType === 'Publication'"
                >{{ totalPerPublication[key] }} / {{ issueCounts![key] }}</template
              >
            </template>
            ></Row
          >
        </div>
        <div v-else>Loading...</div>
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
import Country from '~/components/Country.vue';
import Navigation from '~/components/Navigation.vue';
import Row from '~/components/Row.vue';
import Publication from '~/components/Publication.vue';
import Issue from '~/components/Issue.vue';
import EditIssuesButton from '~/components/EditIssuesButton.vue';
import { computed, ref, watch } from 'vue';
import { collection } from '~/stores/collection';
import { app } from '~/stores/app';

const collectionStore = collection();
const coaStore = coa();
const appStore = app();
const filterText = ref('' as string);
const hasCoaData = ref(false);

const issueCountsPerCountry = computed(() => coaStore.issueCountsPerCountry);
const issueCounts = computed(() => coaStore.issueCounts);
const totalPerPublication = computed(() => collectionStore.totalPerPublication);
const totalPerCountry = computed(() => collectionStore.totalPerCountry);

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

const items = computed((): { key: string; text: string }[] => {
  switch (itemType.value) {
    case 'Country':
      return collectionStore.ownedCountries.map((countryCode) => ({
        key: countryCode,
        text: coaStore.countryNames?.[countryCode] || countryCode,
      }));
    case 'Publication':
      return collectionStore.ownedPublications
        .filter((publication) => publication.indexOf(`${appStore.currentNavigationItem}/`) === 0)
        .map((publicationCode) => ({
          key: publicationCode,
          text: coaStore.publicationNames?.[publicationCode] || publicationCode,
        }));

    case 'Issue':
      return (collectionStore.collection || [])
        .filter((issue) => issue.publicationcode === appStore.currentNavigationItem)
        .map(({ issuenumber }) => ({
          key: issuenumber,
          text: issuenumber,
        }));
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

const sortedItems = computed(() => {
  if (itemType.value === 'Issue') {
    const keys = items.value.map(({ key }) => key);
    return coaStore.issueNumbers[appStore.currentNavigationItem || '']
      .filter((issueNumber) => keys.includes(issueNumber))
      .map((issueNumber) => ({ key: issueNumber, text: issueNumber }));
  } else {
    return [...items.value].sort(({ text: text1 }, { text: text2 }) =>
      text1.toLowerCase().localeCompare(text2.toLowerCase())
    );
  }
});

const filteredItems = computed(() => {
  return sortedItems.value.filter(({ text }) => text.toLowerCase().indexOf(filterText.value) !== -1);
});
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === 'number' ? `My collection (${collectionStore.total} issues)` : 'My collection'
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

(async () => {
  await collection().loadCollection();
  await collection().loadPurchases();
  await coa().fetchCountryNames();
})();
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
