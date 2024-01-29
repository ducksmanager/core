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
            [publishedEdgesSincePreviousVisit.length],
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
          :publicationname="publicationNames[edge.publicationcode]!"
          :issuenumber="edge.issuenumber"
          hide-condition
        >
          <Ago :timestamp="new Date(edge.creationDate).getTime()" />
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
const { loadLastPublishedEdgesForCurrentUser } = collection();
const { previousVisit, lastPublishedEdgesForCurrentUser } =
  storeToRefs(collection());
const { publicationNames } = storeToRefs(coa());
const publishedEdgesSincePreviousVisit = $computed(
  () =>
    lastPublishedEdgesForCurrentUser.value?.filter(
      ({ creationDate }) =>
        previousVisit.value && new Date(creationDate) >= previousVisit.value,
    ) || [],
);
const hasPublicationNames = $computed(() =>
  publishedEdgesSincePreviousVisit?.every(
    ({ publicationcode }) => publicationNames.value[publicationcode],
  ),
);

loadLastPublishedEdgesForCurrentUser();
</script>
