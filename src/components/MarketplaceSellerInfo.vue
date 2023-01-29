<template>
  <span class="d-inline-block me-2">
    <b-badge
      v-if="isBooked"
      variant="info"
      class="small d-inline-flex align-items-center me-2"
      >{{ $t("Réservé !") }}</b-badge
    >
    <template v-if="sentRequest">{{ $t("Demande envoyée à") }}</template
    ><template v-else>{{ $t("En vente par") }}</template
    >&nbsp;<UserPopover
      v-if="points[issueOnSale.userId] && stats[issueOnSale.userId]"
      :points="points[issueOnSale.userId]"
      :stats="stats[issueOnSale.userId]"
      show-ok-for-exchanges
    />
  </span>
</template>

<script setup lang="ts">
import { BBadge } from "bootstrap-vue-next";

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

const isBooked = $computed(
  () =>
    issueOnSale &&
    marketplace().issueRequestsAsBuyer?.find(
      ({ issueId }) => issueId === issueOnSale.id
    )?.isBooked
);
</script>

<style scoped lang="scss">
span {
  color: cyan;
}
</style>
