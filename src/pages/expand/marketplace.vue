<template>
  <b-alert show variant="info">{{
    $t(
      "Cette page indique les numéros que d'autres utilisateurs sur DucksManager proposent à la vente."
    )
  }}</b-alert>
  <div v-if="issuesOnSaleByOthers && hasPublicationNames">
    <b-alert
      v-if="!Object.keys(issuesOnSaleByOthers).length"
      show
      variant="info"
    >
      {{
        $t(
          "Aucun numéro que vous ne possédez pas n'est en vente parmi les magazines que vous avez surveillés"
        )
      }}
    </b-alert>
    <IssueList
      v-for="(issues, publicationcode) in issuesOnSaleByOthers"
      :key="publicationcode"
      :publicationcode="publicationcode"
      :custom-issues="issues"
      owned-only
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup>
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";

const issuesOnSaleByOthers = $computed(() => collection().issuesOnSaleByOthers);
let hasPublicationNames = $ref(false);

onMounted(async () => {
  await collection().loadIssuesOnSaleByOthers();
  await coa().fetchPublicationNames(Object.keys(issuesOnSaleByOthers));
  hasPublicationNames = true;
});
</script>

<style scoped lang="scss">
</style>
