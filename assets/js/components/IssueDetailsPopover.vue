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
      <img
        v-else-if="coverUrl"
        :alt="issueNumber"
        :src="coverUrl"
        class="cover"
      />
      <span v-else>{{
        $t("La couverture de ce numéro n'est pas disponible")
      }}</span></template
    >
  </Popover>
</template>

<script setup>
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
const emit = defineEmits(["cover-loaded"]);

let isCoverLoading = $ref(true);

const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/",
  publicationNames = $computed(() => coa().publicationNames),
  issueDetails = $computed(() => coa().issueDetails),
  id = $computed(
    () => `issue-details-${publicationCode.replace("/", "-")}-${issueNumber}`
  ),
  issueCode = $computed(() => `${publicationCode} ${issueNumber}`),
  coverUrl = $computed(() => {
    const cover = issueDetails?.[issueCode]?.entries?.find(
      ({ position }) => !/^p/.test(position)
    );
    const hasCover = cover?.url;
    emit("cover-loaded", hasCover);
    return hasCover ? cloudinaryBaseUrl + cover.url : null;
  }),
  fetchIssueUrls = coa().fetchIssueUrls,
  loadIssueUrls = async () => {
    isCoverLoading = true;
    await fetchIssueUrls({
      publicationCode,
      issueNumber,
    });
    isCoverLoading = false;
  };
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
