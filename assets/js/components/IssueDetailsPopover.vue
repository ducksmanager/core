<template>
  <b-popover
    :target="`issue-details-${issueNumber}`"
    placement="right"
    triggers="manual"
    show
    @show="loadIssueUrls"
  >
    <template #title>
      <Issue
        :publicationcode="publicationCode"
        :issuenumber="issueNumber"
        :publicationname="publicationNames[publicationCode]"
        hide-condition
      />
    </template>
    <div v-if="isCoverLoading" class="flex-grow-1">
      {{ $t("Chargement...") }}
    </div>
    <img
      v-else-if="coverUrl"
      :alt="issueNumber"
      :src="coverUrl"
      class="cover"
    />
    <span v-else>{{
      $t("La couverture de ce numéro n'est pas disponible")
    }}</span>
  </b-popover>
</template>

<script setup>
import { BPopover } from "bootstrap-vue-3";

import { coa } from "../stores/coa";
import Issue from "./Issue";

const props = defineProps({
  publicationCode: {
    type: String,
    required: true,
  },
  issueNumber: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["cover-loaded"]);

let isCoverLoading = $ref(true);

const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/",
  publicationNames = $computed(() => coa().publicationNames),
  issueDetails = $computed(() => coa().issueDetails),
  id = $computed(
    () =>
      `issue-details-${props.publicationCode.replace("/", "-")}-${
        props.issueNumber
      }`
  ),
  issueCode = $computed(() => `${props.publicationCode} ${props.issueNumber}`),
  coverUrl = $computed(() => {
    const cover = issueDetails?.[issueCode].entries.find(
      ({ position }) => !/^p/.test(position)
    );
    const hasCover = cover && !!cover.url;
    emit("cover-loaded", hasCover);
    return hasCover ? cloudinaryBaseUrl + cover.url : null;
  }),
  fetchIssueUrls = coa().fetchIssueUrls,
  loadIssueUrls = async () => {
    isCoverLoading = true;
    await fetchIssueUrls({
      publicationCode: props.publicationCode,
      issueNumber: props.issueNumber,
    });
    isCoverLoading = false;
  };
</script>

<style scoped lang="scss">
.popover {
  width: 150px;

  :deep(.popover-body) {
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
