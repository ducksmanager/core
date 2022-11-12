<template>
  <div
    v-for="{ buyerId } in receivedRequests || []"
    :key="buyerId"
    class="d-inline-block me-2"
  >
    {{ $t("Demandé par") }}&nbsp;<UserPopover
      v-if="buyerPoints?.[buyerId] && buyerStats?.[buyerId]"
      :points="buyerPoints[buyerId]"
      :stats="buyerStats[buyerId]"
    />
  </div>
</template>

<script setup>
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";

const props = defineProps({
  issueId: {
    type: Number,
    required: true,
  },
});

const receivedRequests = $computed(() =>
  marketplace().issueRequestsAsSeller?.filter(
    ({ issueId }) => issueId === props.issueId
  )
);

const buyerPoints = $computed(() =>
  receivedRequests?.reduce(
    (acc, { buyerId }) => ({ ...acc, [buyerId]: users().points[buyerId] }),
    {}
  )
);

const buyerStats = $computed(() =>
  receivedRequests?.reduce(
    (acc, { buyerId }) => ({ ...acc, [buyerId]: users().stats[buyerId] }),
    {}
  )
);
</script>

<style scoped lang="scss">
div {
  color: cyan;
  display: flex;
  align-items: center;
  margin-right: 10px;
}
</style>
