<template>
  <span v-if="pendingOrSentRequest" class="d-inline-block me-2"
    ><template v-if="pendingRequest">{{
      $t("Demande bientôt envoyée à")
    }}</template
    ><template v-else-if="sentRequest">{{ $t("Demande envoyée à") }}</template
    >&nbsp;<UserPopover
      v-if="sellerPoints && sellerStats"
      :points="sellerPoints"
      :stats="sellerStats"
    />
  </span>
</template>

<script setup>
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";

const props = defineProps({
  publicationcode: {
    type: String,
    required: true,
  },
  issuenumber: {
    type: String,
    required: true,
  },
});

const sellerPoints = $computed(
  () => pendingOrSentRequest && users().points[pendingOrSentRequest.userId]
);
const sellerStats = $computed(
  () => pendingOrSentRequest && users().stats[pendingOrSentRequest.userId]
);

const pendingOrSentRequest = $computed(() => pendingRequest || sentRequest);

const pendingRequest = $computed(() =>
  issuesOnSaleByOthers.find(({ id }) =>
    marketplace().pendingRequestIssueIds?.includes(id)
  )
);

const sentRequest = $computed(() =>
  issuesOnSaleByOthers.find(({ id }) =>
    marketplace().sentRequestIssueIds?.includes(id)
  )
);

const issuesOnSaleByOthers = $computed(() =>
  (marketplace().issuesOnSaleByOthers?.[props.publicationcode] || []).filter(
    ({ issueNumber }) => issueNumber === props.issuenumber
  )
);
</script>

<style scoped lang="scss">
span {
  color: cyan;
}
</style>
