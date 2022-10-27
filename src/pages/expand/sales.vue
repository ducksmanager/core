<template>
  <div v-if="collection && issuesOnSaleByOthers">
    <div v-if="Object.keys(issuesOnSaleByOthers).length">
      <div
        v-for="(issuesOnSale, userId) in issuesOnSaleByOthers"
        :key="`sales-${userId}`"
      >
        <h4>{{ $t("Numéros en vente par {0}", [userId]) }}:</h4>
        <IssueList
          v-for="(issues, publicationCode) in issuesOnSale"
          :key="`sales-${userId}-${publicationCode}`"
          :publicationcode="publicationCode"
          :issues="issues"
          :filter="({ userCopies }) => userCopies.length > 0"
          readonly
        />
      </div>
    </div>
    <b-alert v-else show variant="info">
      {{
        $t(
          "Aucun numéro que vous ne possédez pas n'est en vente parmi les magazines que vous avez surveillés"
        )
      }}
    </b-alert>
  </div>
</template>

<script setup>
import { collection } from "~/stores/collection";

import IssueList from "../../components/IssueList";

const issuesOnSaleByOthers = collection().issuesInOnSaleStack;

onMounted(async () => {
  await collection().loadIssuesOnSaleByOthers();
});
</script>

<style scoped lang="scss">
</style>
