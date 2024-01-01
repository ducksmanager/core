<route lang="yaml">
alias: [/collection/a-lire]
</route>

<template>
  <b-alert variant="info" :model-value="true"
    ><i18n-t
      keypath="Sur cette page les numéros que vous avez indiqué comme 'A vendre' sont listés. Rendez vous sur la page {link_to_marketplace} pour consulter la liste des numéros que les autres utilisateurs DucksManager ont mis en vente."
      ><template #link_to_marketplace
        ><router-link to="/expand/marketplace">{{
          $t("DucksManager marketplace")
        }}</router-link></template
      ></i18n-t
    >
  </b-alert>

  <div
    v-if="
      issuesInOnSaleStack && marketplaceContactMethods && hasPublicationNames
    "
  >
    <b-alert
      variant="warning"
      :model-value="
        issuesInOnSaleStack.length && !marketplaceContactMethods.length
      "
      >{{
        $t(
          "Vous n'avez pas indiqué de moyen de contact pour les collectionneurs intéressés par vos numéros.",
        )
      }}<br /><router-link to="/collection/account">{{
        $t(
          "Si vous souhaitez vendre des numéros, indiquez au moins un moyen de contact.",
        )
      }}</router-link></b-alert
    >
    <IssueList
      v-for="publicationcode in publicationCodes"
      :key="publicationcode"
      :publicationcode="publicationcode"
      on-sale-stack-only
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
let hasPublicationNames = $ref(false as boolean);
let publicationCodes = $ref(null as string[] | null);

const { loadCollection, loadMarketplaceContactMethods } = collection();
const { issuesInOnSaleStack, marketplaceContactMethods } =
  storeToRefs(collection());

const { fetchPublicationNames } = coa();

const { loadIssuesOnSaleByOthers, loadIssueRequestsAsSeller } = marketplace();
const { buyerUserIds } = storeToRefs(marketplace());

const { fetchStats } = users();

watch(
  issuesInOnSaleStack,
  async (value) => {
    if (value) {
      publicationCodes = [
        ...new Set(value.map(({ publicationcode }) => publicationcode)),
      ];

      await fetchPublicationNames(publicationCodes);
      hasPublicationNames = true;
    }
  },
  { immediate: true },
);

(async () => {
  await loadCollection();
  await loadMarketplaceContactMethods();

  await loadIssuesOnSaleByOthers();
  await loadIssueRequestsAsSeller();

  await fetchStats(buyerUserIds.value);
})();
</script>
