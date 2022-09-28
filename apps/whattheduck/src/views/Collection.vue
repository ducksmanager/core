<template>
  <main-layout :title="title">
    <Navigation />

    <ion-searchbar
      v-if="showFilter"
      v-model="filterText"
      placeholder="Filter"
    ></ion-searchbar>
    <div v-if="hasList">
      <template v-if="itemType === 'Country'">
        <ion-segment-button
          :key="key"
          v-for="(text, key) in shownItems"
          @click="appStore.currentNavigationItem = key"
          ><Country :value="text" /></ion-segment-button
      ></template>
      <template v-if="itemType === 'Publication'">
        <ion-segment-button
          :key="item"
          v-for="item in shownItems"
          @click="appStore.currentNavigationItem = item"
          ><Publication :value="item" /></ion-segment-button
      ></template>
      <template v-if="itemType === 'Issue'">
        <ion-segment-button :key="item" v-for="item in shownItems"
          ><Issue :value="item" /></ion-segment-button
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
import Navigation from "@/components/Navigation";
import { computed, onMounted, ref } from "vue";
import { collection } from "@/stores/collection";
import { app } from "@/stores/app";
import { coa } from "@/stores/coa";
import { IonSearchbar, IonSegmentButton } from "@ionic/vue";

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
      return !!collectionStore.collection;
  }
  return false;
});

const items = computed((): { [key: string]: string } => {
  switch (itemType.value) {
    case "Country":
      return collectionStore.ownedCountries.reduce(
        (acc, countryCode) => ({
          ...acc,
          [countryCode]: coaStore.countryNames?.[countryCode],
        }),
        {}
      );
    case "Publication":
      return collectionStore.ownedPublications
        .filter(
          (publication) =>
            publication.indexOf(`${appStore.currentNavigationItem}/`) === 0
        )
        .reduce(
          (acc, publicationCode) => ({
            ...acc,
            [publicationCode]: coaStore.publicationNames[publicationCode],
          }),
          {}
        );
    case "Issue":
      return (collectionStore.collection || [])
        .filter(
          (issue) => issue.publicationCode === appStore.currentNavigationItem
        )
        .map(({ issueNumber }) => issueNumber)
        .reduce((acc, value) => ({ ...acc, [value]: value }), {});
  }
  return {};
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

const shownItems = computed(() => {
  return Object.entries(items.value)
    .filter(([, item]) => item.toLowerCase().indexOf(filterText.value) !== -1)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
});
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === "number"
    ? `My collection (${collectionStore.total} issues)`
    : "My collection"
);

onMounted(async () => {
  await collectionStore.loadCollection();
  await coaStore.fetchCountryNames();
  await coaStore.fetchPublicationNames(
    Object.keys(collectionStore.totalPerPublication)
  );
  hasCoaData.value = true;
  appStore.currentNavigationItem = "fr/MP";
});
</script>
<style lang="scss">
ion-segment-button {
  text-transform: none;
}
</style>
