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
      <i18n-t
        :keypath="
          publishedEdgesSincePreviousVisit.length > 1
            ? 'Accédez à {link_to_bookcase} pour les voir'
            : 'Accédez à {link_to_bookcase} pour la voir'
        "
        tag="div"
      >
        <template #link_to_bookcase>
          <router-link to="/bookcase">{{
            $t("votre bibliothèque")
          }}</router-link>
        </template>
      </i18n-t>
    </template>
  </Accordion>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { coa } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";
const publicationNames = $computed(() => coa().publicationNames);
const previousVisit = $computed(() => collectionStore().previousVisit);
const lastPublishedEdgesForCurrentUser =
  collectionStore().lastPublishedEdgesForCurrentUser;
const publishedEdgesSincePreviousVisit = $computed(
  () =>
    lastPublishedEdgesForCurrentUser?.filter(
      ({ creationDate }) => previousVisit && creationDate >= previousVisit
    ) || []
);
const hasPublicationNames = () =>
  publishedEdgesSincePreviousVisit?.every(
    ({ publicationcode }) => publicationNames[publicationcode]
  );

onMounted(async () => {
  await collectionStore().loadLastPublishedEdgesForCurrentUser();
});
</script>

<style scoped>

</style>
