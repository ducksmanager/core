<template>
  <Accordion
    v-if="publishedEdgesSincePreviousVisit?.length && hasPublicationNames"
    id="last-published-edges"
    accordion-group-id="last-published-edges"
  >
    <template #header>
      <div
        v-html="
          $t(
            publishedEdgesSincePreviousVisit.length > 1
              ? 'Depuis votre dernière visite, {0} nouvelles tranches appartenant à votre collection a été conçue pour la bibliothèque DucksManager'
              : 'Depuis votre dernière visite, {0} nouvelle tranche appartenant à votre collection a été conçue pour la bibliothèque DucksManager',
            [publishedEdgesSincePreviousVisit.length]
          )
        "
      />
    </template>
    <template #content>
      <div
        v-for="edge in publishedEdgesSincePreviousVisit"
        :key="`last-published-${edge.id}`"
      >
        <Issue
          :publicationcode="edge.publicationcode"
          :publicationname="publicationNames[edge.publicationcode]"
          :issuenumber="edge.issuenumber"
          hide-condition
        >
          <Ago :timestamp="edge.timestamp" />
        </Issue>
      </div>
    </template>
    <template #footer>
      <div
        v-html="
          $t(
            publishedEdgesSincePreviousVisit.length > 1
              ? `Accédez à <a href='/bookcase'>votre bibliothèque</a> pour les voir.`
              : `Accédez à <a href='/bookcase'>votre bibliothèque</a> pour la voir.`
          )
        "
      />
    </template>
  </Accordion>
</template>
<script setup>
import Accordion from "./Accordion";
import Issue from "./Issue";
import Ago from "./Ago";
import { coa } from "../stores/coa";
import { computed, onMounted } from "vue";
const { collection: collectionStore } = require("../stores/collection");

const publicationNames = computed(() => coa().publicationNames),
  previousVisit = computed(() => collectionStore().previousVisit),
  lastPublishedEdgesForCurrentUser =
    collectionStore().lastPublishedEdgesForCurrentUser,
  publishedEdgesSincePreviousVisit = () =>
    lastPublishedEdgesForCurrentUser.value?.filter(
      ({ creationDate }) => creationDate >= previousVisit.value
    ),
  hasPublicationNames = () =>
    publishedEdgesSincePreviousVisit.value?.every(
      ({ publicationcode }) => publicationNames.value[publicationcode]
    );

onMounted(async () => {
  await collectionStore().loadLastPublishedEdgesForCurrentUser();
});
</script>

<style scoped>

</style>
