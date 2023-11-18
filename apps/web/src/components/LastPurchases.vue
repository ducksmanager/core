<template>
  <Accordion
    v-if="collectionPerPurchaseDate && hasPublicationNames"
    id="last-purchases"
    accordion-group-id="last-purchases"
    visible
  >
    <template #header>
      {{ $t("Derniers achats") }}
    </template>
    <template #content>
      <Accordion
        v-for="(
          { purchase, issues }, purchaseIndex
        ) in collectionPerPurchaseDate"
        :id="`purchase-accordion-${purchaseIndex}`"
        :key="`purchase-accordion-${purchaseIndex}`"
        :accordion-group-id="`purchase-accordion-${purchaseIndex}`"
        :visible="false"
      >
        <template #header>
          <b>{{ purchase.date }}</b
          >&nbsp;<i v-if="purchase.description"
            >{{ purchase.description }}&nbsp;</i
          >{{ issues.length }}
          {{ t("numéro | numéros", issues.length) }}
        </template>
        <template #content>
          <Issue
            v-for="{ publicationcode, issuenumber } in issues"
            :key="`purchase-${purchaseIndex}-issue-${publicationcode}-${issuenumber}`"
            :publicationcode="publicationcode"
            :publicationname="publicationNames[publicationcode]!"
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
import { collection as collectionStore } from "~/stores/collection";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

const { t } = useI18n();
const hasPublicationNames = $computed(() => Object.keys(publicationNames)),
  publicationNames = $computed(() => coa().publicationNames),
  collectionPerPurchaseDate = $computed(() => {
    const purchasesById = collectionStore().purchasesById;
    return (
      purchasesById &&
      collectionStore()
        .collection?.reduce(
          (acc, issue) => {
            const existingPurchase =
              issue.purchaseId && purchasesById[issue.purchaseId];
            const purchase = existingPurchase
              ? {
                  date: existingPurchase.date,
                  description: existingPurchase.description,
                }
              : {
                  date: (
                    (issue.creationDate || "0001-01-01T00:00:00") as string
                  ).split("T")[0],
                  description: "",
                };
            let purchaseIndex = acc.findIndex(
              ({ purchase: currentPurchase }) =>
                (currentPurchase.date as string) === (purchase.date as string),
            );
            if (purchaseIndex === -1) {
              acc.push({
                purchase: {
                  date: purchase.date as string,
                  description: purchase.description,
                },
                issues: [],
              });
              purchaseIndex = acc.length - 1;
            }
            acc[purchaseIndex].issues.push(issue);
            return acc;
          },
          [] as {
            purchase: { date: string; description: string };
            issues: IssueWithPublicationcode[];
          }[],
        )
        .sort(({ purchase: purchase1 }, { purchase: purchase2 }) =>
          purchase1.date < purchase2.date ? 1 : -1,
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
