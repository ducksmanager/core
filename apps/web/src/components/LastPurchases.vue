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
          <b>{{ purchase.date.toLocaleDateString(locale) }}</b
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
import { issue } from "~prisma-clients/extended/dm.extends";

const { publicationNames } = storeToRefs(coa());
const { purchasesById, issues: allIssues } = storeToRefs(collection());

const { t, locale } = useI18n();
const hasPublicationNames = $computed(() => Object.keys(publicationNames)),
  collectionPerPurchaseDate = $computed(
    () =>
      purchasesById.value &&
      allIssues.value
        ?.reduce<
          {
            purchase: { date: Date; description: string };
            issues: issue[];
          }[]
        >(
          (acc, issue) => {
            const existingPurchase =
              issue.purchaseId && purchasesById.value![issue.purchaseId];
            const purchase = existingPurchase
              ? {
                  date: existingPurchase.date,
                  description: existingPurchase.description,
                }
              : {
                  date: new Date(issue.creationDate as unknown as string),
                  description: "",
                };
            let purchaseIndex = acc.findIndex(
              ({ purchase: currentPurchase }) =>
                currentPurchase.date === purchase.date,
            );
            if (purchaseIndex === -1 && purchase.date) {
              acc.push({
                purchase: {
                  date: purchase.date,
                  description: purchase.description,
                },
                issues: [],
              });
              purchaseIndex = acc.length - 1;
            }
            acc[purchaseIndex]?.issues?.push(issue);
            return acc;
          },
          [] as {
            purchase: { date: Date; description: string };
            issues: issue[];
          }[],
        )
        .sort(({ purchase: purchase1 }, { purchase: purchase2 }) =>
          purchase1.date < purchase2.date ? 1 : -1,
        )
        .slice(0, 5),
  );
</script>

<style scoped lang="scss">
:deep(.card-body) {
  color: black;
}
</style>
