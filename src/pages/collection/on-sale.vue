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
          "Vous n'avez pas indiqué de moyen de contact pour les collectionneurs intéressés par vos numéros."
        )
      }}<br /><router-link to="/collection/account">{{
        $t(
          "Si vous souhaitez vendre des numéros, indiquez au moins un moyen de contact."
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
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";
let hasPublicationNames = $ref(false as boolean);
let publicationCodes = $ref(null as string[] | null);
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
          issuesInOnSaleStack.map(({ publicationcode }) => publicationcode)
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

<style scoped></style>
