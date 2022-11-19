<template>
  <span v-if="sentRequest" class="d-inline-block me-2"
    >{{ $t("Demande envoyée à") }}&nbsp;<UserPopover
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
  () => sentRequest && users().points[sentRequest.userId]
);
const sellerStats = $computed(
  () => sentRequest && users().stats[sentRequest.userId]
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
