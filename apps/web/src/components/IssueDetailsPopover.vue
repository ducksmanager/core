<template>
  <Popover
    v-if="publicationNames[publicationcode]"
    placement="right"
    @open:popper="loadIssueUrls"
  >
    <i-bi-eye-fill
      :id="`issue-details-${issuecode.replaceAll(' ', '_')}`"
      class="mx-2"
      :class="{
        [`can-show-book-${
          !coverUrls[issuecode] ? coverUrls[issuecode] : true
        }`]: true,
      }"
      :alt="$t('Voir')"
      @click.prevent="$emit('click')"
    />
    <template #header>
      <Issue :issuecode="issuecode" hide-condition :flex="false" no-wrap />
    </template>
    <template #content>
      <div v-if="isCoverLoading" class="flex-grow-1">
        {{ $t("Chargement...") }}
      </div>
      <template v-else-if="fullUrl">
        <img
          :alt="issuenumber"
          :src="fullUrl"
          class="cover"
          @error="fullUrl = null"
          @click="$emit('click')"
        />
        <div>
          {{ $t("Cliquez sur la couverture pour parcourir ce numéro") }}
        </div>
      </template>
      <span v-else>{{
        $t("La couverture de ce numéro n'est pas disponible")
      }}</span>
    </template>
  </Popover>
</template>

<script setup lang="ts">
const { issuecode } = defineProps<{
  issuecode: string;
}>();
defineEmits<{ (e: "click"): void }>();

let isCoverLoading = $ref(true);
let fullUrl = $ref<string | null>(null);
let publicationcode = $ref<string>("");
let issuenumber = $ref<string>("");

const { fetchIssueUrls, setCoverUrl, fetchIssuecodeDetails } = coa();
const { publicationNames, issueDetails, issuecodeDetails, coverUrls } =
  storeToRefs(coa());

watch(
  $$(issuecode),
  async () => {
    await fetchIssuecodeDetails([issuecode]);
    ({ publicationcode, issuenumber } = issuecodeDetails.value[issuecode]);
  },
  { immediate: true },
);

const cloudinaryBaseUrl =
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/";

const loadIssueUrls = async () => {
  isCoverLoading = true;
  await fetchIssueUrls({
    issuecode,
  });
  isCoverLoading = false;

  const possibleCoverUrl = issueDetails.value?.[issuecode]?.entries?.find(
    ({ position }) => !/^p/.test(position),
  )?.url;
  fullUrl = possibleCoverUrl ? cloudinaryBaseUrl + possibleCoverUrl : null;
};

watch($$(fullUrl), (value) => {
  if (value) {
    setCoverUrl(issuecode, value);
  }
});
</script>

<style scoped lang="scss">
.can-show-book-undefined {
  cursor: initial;
}

.can-show-book-false {
  cursor: not-allowed;
}

.can-show-book-true {
  cursor: pointer;
}
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
