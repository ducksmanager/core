<template>
  <Popover
    v-if="publicationNames[publicationcode]"
    placement="right"
    @open:popper="loadIssueUrls"
  >
    <i-bi-eye-fill
      :id="`issue-details-${issuenumber}`"
      class="mx-2"
      :class="{
        [`can-show-book-${
          !coverUrls[issuenumber] ? coverUrls[issuenumber] : true
        }`]: true,
      }"
      :alt="$t('Voir')"
      @click.prevent="$emit('click')"
    />
    <template #header>
      <Issue
        :publicationcode="publicationcode"
        :issuenumber="issuenumber"
        :publicationname="publicationNames[publicationcode]!"
        hide-condition
        :flex="false"
        no-wrap
      />
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
const { issuenumber, publicationcode } = defineProps<{
  publicationcode: string;
  issuenumber: string;
}>();
defineEmits<{ (e: "click"): void }>();

let isCoverLoading = $ref(true as boolean);
let fullUrl = $ref(null as string | null);

const { fetchIssueUrls, setCoverUrl } = coa();
const { publicationNames, issueDetails, coverUrls } = storeToRefs(coa());

const cloudinaryBaseUrl =
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/";
const issueCode = $computed(() => `${publicationcode} ${issuenumber}`);

const loadIssueUrls = async () => {
  isCoverLoading = true;
  await fetchIssueUrls({
    publicationcode,
    issuenumber,
  });
  isCoverLoading = false;

  const possibleCoverUrl = issueDetails.value?.[issueCode]?.entries?.find(
    ({ position }) => !/^p/.test(position),
  )?.url;
  fullUrl = possibleCoverUrl ? cloudinaryBaseUrl + possibleCoverUrl : null;
};

watch($$(fullUrl), (value) => {
  if (value) {
    setCoverUrl(issuenumber, value);
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
