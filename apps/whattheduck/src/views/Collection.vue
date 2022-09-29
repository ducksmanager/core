<template>
  <main-layout :title="title">
    <ion-searchbar
      v-if="showFilter"
      v-model="filterText"
      placeholder="Filter"
    ></ion-searchbar>
    <div v-if="hasList">
      <template v-if="itemType === 'Country'">
        <ion-item
          button
          :key="key"
          v-for="{ text, key } in filteredItems"
          @click="appStore.currentNavigationItem = key"
        >
          <Country :value="text" /></ion-item
      ></template>
      <template v-if="itemType === 'Publication'">
        <ion-item
          button
          :key="key"
          v-for="{ text, key } in filteredItems"
          @click="appStore.currentNavigationItem = key"
          ><Publication :value="text"
        /></ion-item>
      </template>
      <template v-if="itemType === 'Issue'">
        <ion-item button :key="key" v-for="{ key } in filteredItems"
          ><Issue :value="key" /></ion-item
      ></template>
    </div>
    <div v-else>Loading...</div>
  </main-layout>
</template>
<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
import Country from "@/components/Country";
import Publication from "@/components/Publication";
import Issue from "@/components/Issue";
import { computed, onMounted, ref, watch } from "vue";
import { collection } from "@/stores/collection";
import { app } from "@/stores/app";
import { coa } from "@/stores/coa";
import { IonSearchbar, IonItem } from "@ionic/vue";

defineEmits(["click"]);

const collectionStore = collection();
const coaStore = coa();
const appStore = app();
const filterText = ref("" as string);
const hasCoaData = ref(false);

const hasList = computed((): boolean => {
  if (!hasCoaData.value) {
    return false;
  }
  switch (itemType.value) {
    case "Country":
      return !!collectionStore.ownedCountries;
    case "Publication":
      return !!collectionStore.ownedPublications /* &&
        collectionStore.ownedPublications.filter((publicationCode) =>
          Object.keys(coaStore.publicationNames).includes(publicationCode)
        ).length === collectionStore.ownedPublications.length
      )*/;
    case "Issue":
      return (
        !!collectionStore.collection &&
        !!coaStore.issueNumbers[appStore.currentNavigationItem || ""]
      );
  }
  return false;
});

const items = computed((): { key: string; text: string }[] => {
  switch (itemType.value) {
    case "Country":
      return collectionStore.ownedCountries.map((countryCode) => ({
        key: countryCode,
        text: coaStore.countryNames?.[countryCode] || countryCode,
      }));
    case "Publication":
      return collectionStore.ownedPublications
        .filter(
          (publication) =>
            publication.indexOf(`${appStore.currentNavigationItem}/`) === 0
        )
        .map((publicationCode) => ({
          key: publicationCode,
          text: coaStore.publicationNames?.[publicationCode] || publicationCode,
        }));

    case "Issue":
      return (collectionStore.collection || [])
        .filter(
          (issue) => issue.publicationCode === appStore.currentNavigationItem
        )
        .map(({ issueNumber }) => ({
          key: issueNumber,
          text: issueNumber,
        }));
  }
  return [];
});

const itemType = computed(() => {
  switch (appStore.currentNavigationItem?.indexOf("/")) {
    case undefined:
      return "Country";
    case -1:
      return "Publication";
    default:
      return "Issue";
  }
});

const sortedItems = computed(() => {
  if (itemType.value === "Issue") {
    const keys = items.value.map(({ key }) => key);
    return coaStore.issueNumbers[appStore.currentNavigationItem || ""]
      .filter((issueNumber) => keys.includes(issueNumber))
      .map((issueNumber) => ({ key: issueNumber, text: issueNumber }));
  } else {
    return [...items.value].sort(({ text: text1 }, { text: text2 }) =>
      text1.toLowerCase() < text2.toLowerCase() ? -1 : 1
    );
  }
});

const filteredItems = computed(() => {
  return sortedItems.value.filter(
    ({ text }) => text.toLowerCase().indexOf(filterText.value) !== -1
  );
});
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === "number"
    ? `My collection (${collectionStore.total} issues)`
    : "My collection"
);

watch(
  () => itemType.value,
  async (newValue) => {
    switch (newValue) {
      case "Country":
        await coaStore.fetchCountryNames();
        break;
      case "Publication":
        await coaStore.fetchPublicationNames([
          appStore.currentNavigationItem || "",
        ]);
        break;
      case "Issue":
        await coaStore.fetchIssueNumbers([
          appStore.currentNavigationItem || "",
        ]);
        break;
    }
    hasCoaData.value = true;
  },
  { immediate: true }
);

onMounted(async () => {
  // await collectionStore.loadCollection();
  // await coaStore.fetchPublicationNames(
  //   Object.keys(collectionStore.totalPerPublication)
  // );
});
</script>
