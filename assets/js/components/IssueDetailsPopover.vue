<template>
  <Popover placement="right" @open:popper="loadIssueUrls">
    <slot />
    <template #header>
      <Issue
        :publicationcode="publicationCode"
        :issuenumber="issueNumber"
        :publicationname="publicationNames[publicationCode]"
        hide-condition
        :flex="false"
        no-wrap
      />
    </template>
    <template #content>
      <div v-if="isCoverLoading" class="flex-grow-1">
        {{ $t("Chargement...") }}
      </div>
      <template v-else-if="coverUrl">
        <img
          :alt="issueNumber"
          :src="coverUrl"
          class="cover"
          @error="coverUrl = null"
          @click="$emit('click')"
        />
        <div>
          {{ $t("Cliquez sur la couverture pour parcourir ce numéro") }}
        </div>
      </template>
      <span v-else>{{
        $t("La couverture de ce numéro n'est pas disponible")
      }}</span></template
    >
  </Popover>
</template>

<script setup>
import { onMounted, watch } from "vue";

import { coa } from "../stores/coa";
import Issue from "./Issue";
import Popover from "./Popover";

const { issueNumber, publicationCode } = defineProps({
  publicationCode: {
    type: String,
    required: true,
  },
  issueNumber: {
    type: String,
    required: true,
  },
});
defineEmits(["click"]);

let isCoverLoading = $ref(true),
  coverUrl = $ref(null);

const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/",
  publicationNames = $computed(() => coa().publicationNames),
  issueDetails = $computed(() => coa().issueDetails),
  id = $computed(
    () => `issue-details-${publicationCode.replace("/", "-")}-${issueNumber}`
  ),
  issueCode = $computed(() => `${publicationCode} ${issueNumber}`),
  fetchIssueUrls = coa().fetchIssueUrls,
  loadIssueUrls = async () => {
    isCoverLoading = true;
    await fetchIssueUrls({
      publicationCode,
      issueNumber,
    });
    isCoverLoading = false;

    const possibleCoverUrl = issueDetails?.[issueCode]?.entries?.find(
      ({ position }) => !/^p/.test(position)
    )?.url;
    coverUrl = possibleCoverUrl ? cloudinaryBaseUrl + possibleCoverUrl : null;
  };

watch(
  () => coverUrl,
  (value) => {
    coa().setCoverUrl(issueNumber, value);
  }
);
</script>

<style scoped lang="scss">
:deep(.popper) {
  width: 150px;

  .card-body {
    padding: 0;

    .cover {
      width: 100%;
    }
  }
}

label {
  font-weight: bold;
}
</style>
