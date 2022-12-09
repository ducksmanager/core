<template>
  <Popover
    v-if="publicationNames[publicationCode]"
    placement="right"
    @open:popper="loadIssueUrls"
  >
    <b-icon-eye-fill
      :id="`issue-details-${issueNumber}`"
      class="mx-2"
      :class="{
        [`can-show-book-${
          !coverUrls[issueNumber] ? coverUrls[issueNumber] : true
        }`]: true,
      }"
      :alt="$t('Voir')"
      @click.prevent="$emit('click')"
    />
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
      }}</span>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { BIconEyeFill } from "bootstrap-icons-vue";
import { watch } from "vue";

import { coa } from "~/stores/coa";

const { issueNumber, publicationCode } = defineProps<{
  publicationCode: string;
  issueNumber: string;
}>();
defineEmits<{ (e: "click"): void }>();

let isCoverLoading = $ref(true as boolean);
let coverUrl = $ref(null as string | null);

const cloudinaryBaseUrl =
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/";
const publicationNames = $computed(() => coa().publicationNames);
const issueDetails = $computed(() => coa().issueDetails);
const issueCode = $computed(() => `${publicationCode} ${issueNumber}`);
const coverUrls = $computed(() => coa().coverUrls);

const loadIssueUrls = async () => {
  isCoverLoading = true;
  await coa().fetchIssueUrls({
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
    if (value) {
      coa().setCoverUrl(issueNumber, value);
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
