<template>
  <div
    v-for="{ buyerId, isBooked } in receivedRequests || []"
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
