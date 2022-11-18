<route lang="yaml">
alias: [/collection/a-lire]
</route>

<template>
  <b-alert
    variant="info"
    show
    v-html="
      $t(
        `Sur cette page les numéros que vous avez indiqué comme 'A vendre' sont listés. rendez vous sur la page {1} pour consulter la liste des numéros que les autres utilisateurs DucksManager ont mis en vente.`,
        [`<a href='/expand/marketplace'>${$t('DucksManager marketplace')}</a>`]
      )
    "
  />
  <div
    v-if="
      issuesInOnSaleStack && marketplaceContactMethods && hasPublicationNames
    "
  >
    <BAlert
      variant="warning"
      :show="issuesInOnSaleStack.length && !marketplaceContactMethods.length"
      >{{
        $t(
          "Vous n'avez pas indiqué de moyen de contact pour les collectionneurs intéressés par vos numéros."
        )
      }}<br /><a href="/collection/account">{{
        $t(
          "Si vous souhaitez vendre des numéros, indiquez au moins un moyen de contact."
        )
      }}</a></BAlert
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

<script setup>
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";
let hasPublicationNames = $ref(false);
let publicationCodes = $ref(null);
const issuesInOnSaleStack = $computed(() => collection().issuesInOnSaleStack);
const marketplaceContactMethods = $computed(
  () => collection().marketplaceContactMethods
);

watch(
  () => issuesInOnSaleStack,
  async (issuesInOnSaleStack) => {
    if (issuesInOnSaleStack) {
      publicationCodes = [
        ...new Set(
          issuesInOnSaleStack.map(({ publicationCode }) => publicationCode)
        ),
      ];

      await coa().fetchPublicationNames(publicationCodes);
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await collection().loadCollection();
  await collection().loadMarketplaceContactMethods();

  await marketplace().loadIssuesOnSaleByOthers();
  await marketplace().loadIssueRequestsAsSeller();

  await users().fetchStats(marketplace().buyerUserIds);
});
</script>

<style scoped>
</style>
