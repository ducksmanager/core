<template>
  <template v-if="isOnSale">
    <template v-if="receivedRequests?.length">
      <div
        v-for="{ buyerId, isBooked } in receivedRequests"
        :key="buyerId"
        class="d-inline-block me-2"
        :class="{ setAside: isBooked }"
      >
        <template v-if="isBooked">{{ $t("Réservé pour") }}</template
        ><template v-else>{{ $t("Demandé par") }}</template
        >&nbsp;<UserPopover
          v-if="buyerPoints?.[buyerId] && buyerStats?.[buyerId]"
          :points="buyerPoints[buyerId]"
          :stats="buyerStats[buyerId]"
        /></div
    ></template>

    <div v-else class="d-inline-block me-2">{{ $t("A vendre") }}</div>
  </template>
</template>

<script setup lang="ts">
import { MedalPointsPerUser } from "~dm-types/MedalPointsPerUser";
import { QuickStatsPerUser } from "~dm-types/QuickStatsPerUser";

const { issueId } = defineProps<{
  issueId: number;
}>();

const { issueRequestsAsSeller } = storeToRefs(marketplace());

const { points, stats } = storeToRefs(users());
const { issuesInOnSaleStack } = storeToRefs(collection());

const receivedRequests = $computed(() =>
  issueRequestsAsSeller.value?.filter(
    ({ issueId: requestIssueId }) => requestIssueId === issueId,
  ),
);

const buyerPoints = $computed(
  () =>
    receivedRequests?.reduce<Record<number, MedalPointsPerUser[0]>>(
      (acc, { buyerId }) => ({ ...acc, [buyerId]: points.value[buyerId] }),
      {},
    ) || {},
);

const buyerStats = $computed(
  () =>
    receivedRequests?.reduce<Record<number, QuickStatsPerUser[0]>>(
      (acc, { buyerId }) => ({ ...acc, [buyerId]: stats.value[buyerId] }),
      {},
    ) || {},
);

const isOnSale = $computed(() =>
  issuesInOnSaleStack.value?.find(({ id }) => id === issueId),
);
</script>

<style scoped lang="scss">
div,
* {
  display: flex;
  align-items: center;
  color: yellow;

  &.setAside {
    &,
    * {
      color: blue;
    }
  }
}
</style>
