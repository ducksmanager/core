<template>
  <span
    v-for="issueOnSale of issuesOnSaleByOthers"
    :key="issueOnSale.id"
    class="d-inline-block me-2"
  >
    <template v-if="sentRequests.includes(issueOnSale.id)">{{
      $t("Demande envoyée à")
    }}</template
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

const props = defineProps<{
  publicationcode: string;
  issuenumber: string;
}>();

const points = $computed(() => users().points);
const stats = $computed(() => users().stats);

const sentRequests = $computed(() =>
  issuesOnSaleByOthers
    .filter(({ id }) => marketplace().sentRequestIssueIds?.includes(id))
    .map(({ id }) => id)
);

const issuesOnSaleByOthers = $computed(() =>
  (marketplace().issuesOnSaleByOthers?.[props.publicationcode] || []).filter(
    ({ issuenumber }) => issuenumber === props.issuenumber
  )
);
</script>

<style scoped lang="scss">
span {
  color: cyan;
}
</style>
