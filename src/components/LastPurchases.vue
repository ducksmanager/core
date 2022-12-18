<template>
  <Accordion
    v-if="collectionPerPurchaseDate"
    id="last-purchases"
    accordion-group-id="last-purchases"
    visible
  >
    <template #header>
      {{ $t("Derniers achats") }}
    </template>
    <template #content>
      <Accordion
        v-for="(purchaseAndIssues, purchaseIndex) in collectionPerPurchaseDate"
        :id="`purchase-accordion-${purchaseIndex}`"
        :key="`purchase-accordion-${purchaseIndex}`"
        :accordion-group-id="`purchase-accordion-${purchaseIndex}`"
        :visible="false"
      >
        <template #header>
          <b>{{ purchaseAndIssues.purchase.date }}</b
          >&nbsp;<i v-if="purchaseAndIssues.purchase.description"
            >{{ purchaseAndIssues.purchase.description }}&nbsp;</i
          >{{ purchaseAndIssues.issues.length }}
          {{ t("numéro | numéros", purchaseAndIssues.issues.length) }}
        </template>
        <template #content>
          <Issue
            v-for="{ publicationcode, issuenumber } in purchaseAndIssues.issues"
            :key="`purchase-${purchaseIndex}-issue-${publicationcode}-${issuenumber}`"
            :publicationcode="publicationcode"
            :publicationname="publicationNames[publicationcode]"
            :issuenumber="issuenumber"
            :no-wrap="false"
          />
        </template>
      </Accordion>
    </template>
  </Accordion>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import {
  collection as collectionStore,
  IssueWithPublicationcode,
} from "~/stores/collection";

const { t } = useI18n();
const publicationNames = $computed(() => coa().publicationNames),
  collectionPerPurchaseDate = $computed(() => {
    const purchases = collectionStore().purchases;
    return (
      purchases &&
      collectionStore()
        .collection?.reduce((acc, issue) => {
          const purchase = (issue.purchaseId > 0 &&
            purchases.find(({ id }) => id === issue.purchaseId)) || {
            date: (
              (issue.creationDate || "0001-01-01T00:00:00") as string
            ).split("T")[0],
            description: "",
          };
          let purchaseIndex = acc.findIndex(
            ({ purchase: currentPurchase }) =>
              currentPurchase.date === purchase.date
          );
          if (purchaseIndex === -1) {
            acc.push({ purchase, issues: [] });
            purchaseIndex = acc.length - 1;
          }
          acc[purchaseIndex].issues.push(issue);
          return acc;
        }, [] as { purchase: { date: string; description: string }; issues: IssueWithPublicationcode[] }[])
        .sort(({ purchase: purchase1 }, { purchase: purchase2 }) =>
          purchase1.date < purchase2.date ? 1 : -1
        )
        .slice(0, 5)
    );
  });
</script>

<style scoped lang="scss">
:deep(.card-body) {
  color: black;
}
</style>
