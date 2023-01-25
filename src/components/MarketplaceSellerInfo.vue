<template>
  <span class="d-inline-block me-2">
    <template v-if="sentRequest">{{ $t("Demande envoyée à") }}</template
    ><template v-else>{{ $t("En vente par") }}</template
    >&nbsp;<UserPopover
      v-if="points[issueOnSale.userId] && stats[issueOnSale.userId]"
      :points="points[issueOnSale.userId]"
      :stats="stats[issueOnSale.userId]"
    />
  </span>
</template>

<script setup lang="ts">
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";

const { publicationcode, issuenumber, copyIndex } = defineProps<{
  publicationcode: string;
  issuenumber: string;
  copyIndex: number;
}>();

const points = $computed(() => users().points);
const stats = $computed(() => users().stats);

const sentRequest = $computed(() =>
  marketplace().sentRequestIssueIds?.includes(issueOnSale?.id)
);

const issueOnSale = $computed(
  () =>
    (marketplace().issuesOnSaleByOthers?.[publicationcode] || []).filter(
      ({ issuenumber: onSaleIssuenumber }) => onSaleIssuenumber === issuenumber
    )[copyIndex]
);
</script>

<style scoped lang="scss">
span {
  color: cyan;
}
</style>
