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
      v-if="points[issueOnSale.userId] && userStats[issueOnSale.userId]"
      :points="points[issueOnSale.userId]"
      :stats="userStats[issueOnSale.userId]"
      show-ok-for-exchanges
    />
  </span>
</template>

<script setup lang="ts">
const { issuecode, copyIndex } = defineProps<{
  issuecode: string;
  copyIndex: number;
}>();

const { points, stats: userStats } = storeToRefs(users());
const { sentRequestIssueIds, issuesOnSaleByOthers, issueRequestsAsBuyer } =
  storeToRefs(marketplace());

const sentRequest = $computed(() =>
  sentRequestIssueIds.value?.includes(issueOnSale.id),
);

const issueOnSale = $computed(
  () =>
    (issuesOnSaleByOthers.value || []).filter(
      ({ issuecode: onSaleIssuecode }) => onSaleIssuecode === issuecode,
    )[copyIndex],
);

const isBooked = $computed(
  () =>
    issueRequestsAsBuyer.value?.find(
      ({ issueId }) => issueId === issueOnSale.id,
    )?.isBooked,
);
</script>

<style scoped lang="scss">
span {
  color: cyan;
}
</style>
