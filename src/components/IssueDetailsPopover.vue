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
        :publicationname="publicationNames[publicationcode]"
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
          :alt="issuenumber"
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
      }}</span>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { watch } from "vue";

import { coa } from "~/stores/coa";

const { issuenumber, publicationcode } = defineProps<{
  publicationcode: string;
  issuenumber: string;
}>();
defineEmits<{ (e: "click"): void }>();

let isCoverLoading = $ref(true as boolean);
let coverUrl = $ref(null as string | null);

const cloudinaryBaseUrl =
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/";
const publicationNames = $computed(() => coa().publicationNames);
const issueDetails = $computed(() => coa().issueDetails);
const issueCode = $computed(() => `${publicationcode} ${issuenumber}`);
const coverUrls = $computed(() => coa().coverUrls);

const loadIssueUrls = async () => {
  isCoverLoading = true;
  await coa().fetchIssueUrls({
    publicationcode,
    issuenumber,
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
    if (value) {
      coa().setCoverUrl(issuenumber, value);
    }
  }
);
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
