<template>
  <main-layout :title="title">
    <Navigation />

    <ion-searchbar
      v-if="showFilter"
      v-model="filterText"
      placeholder="Filter"
    ></ion-searchbar>
    <div v-if="shownItems">
      <template v-if="itemType === 'Issue'">
        <ion-segment-button :key="item" v-for="item in shownItems"
          ><Issue :value="item" /></ion-segment-button
      ></template>
    </div>
  </main-layout>
</template>
<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
import Issue from "@/components/Issue";
import Navigation from "@/components/Navigation";
import { computed, onMounted, ref, watch } from "vue";
import { collection } from "@/stores/collection";
import { app } from "@/stores/app";
import { IonSearchbar, IonSegmentButton } from "@ionic/vue";
import { IssueWithPublicationCode } from "@/types/IssueWithPublicationCode";

const collectionStore = collection();
const appStore = app();
const filterText = ref("" as string);
const items = ref(null as IssueWithPublicationCode[] | null);
const itemType = ref("Issue" as string);

const shownItems = computed(() =>
  items.value?.filter(
    (item) => item.issueNumber.toLowerCase().indexOf(filterText.value) !== -1
  )
);
const showFilter = computed(() => true);

const title = computed(() =>
  typeof collectionStore.total === "number"
    ? `My collection (${collectionStore.total} issues)`
    : "My collection"
);

onMounted(async () => {
  await collectionStore.loadCollection();
  appStore.currentCountry = "fr";
  appStore.currentPublication = "fr/MP";
});

watch(
  () => collectionStore.collection && appStore.currentPublication,
  (isReady) => {
    if (isReady) {
      items.value =
        collectionStore.collection?.filter(
          ({ publicationCode }) =>
            publicationCode === appStore.currentPublication
        ) || null;
    }
  },
  { immediate: true }
);
</script>
