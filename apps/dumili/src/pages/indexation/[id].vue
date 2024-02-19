<template>
  <b-container
    v-if="indexationId"
    fluid
    style="max-height: calc(100% - 35px); flex-grow: 1"
    class="d-flex flex-column"
  >
    <template v-if="tabNames[activeTab] === 'page-gallery'"
      ><Gallery :images="images" />
      <upload-widget
        v-if="showUploadWidget"
        :folder-name="indexationId"
        @done="
          showUploadWidget = !showUploadWidget;
          getIndexation();
        "
        @abort="showUploadWidget = !showUploadWidget"
      />
      <b-button
        v-show="!showUploadWidget"
        @click="showUploadWidget = !showUploadWidget"
      >
        {{ $t("Upload page files") }}
      </b-button>
    </template>
    <Book
      v-else-if="tabNames[activeTab] === 'book'"
      :indexation-id="indexationId" />
    <TextEditor v-else-if="tabNames[activeTab] === 'text-editor'"
  /></b-container>
  <b-container>
    <b-container
      v-if="activeTab !== undefined"
      class="start-0 bottom-0 mw-100 pt-2 h-5"
      style="height: 35px"
      ><b-tabs v-model:modelValue="activeTab" align="center"
        ><b-tab :title="$t('Page gallery')" /><b-tab
          :title="$t('Book')" /><b-tab
          :title="$t('Text editor')" /></b-tabs></b-container
  ></b-container>
</template>

<script setup lang="ts">
import { getIndexationSocket } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";
import { tabs } from "~/stores/tabs";

const showUploadWidget = ref(false);
const route = useRoute();

const { t: $t } = useI18n();

const { activeTab } = storeToRefs(tabs());
const { tabNames } = tabs();

const indexationId = ref<string | null>(null);

const { indexation } = storeToRefs(suggestions());
const images = computed(() =>
  indexation.value!.pages.map(({ url }) => ({
    url,
    text: url,
  }))
);
const getIndexation = async () => {
  const data = await getIndexationSocket(indexationId.value!).getIndexation();
  if ("error" in data) {
    console.error(data.error);
    return;
  }
  indexation.value = data.indexation;
};

watch(
  () => route.params.id,
  (id) => {
    indexationId.value = id as string;
    getIndexation();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
#main {
  max-height: calc(100vh - 108px);
}
.col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control::placeholder {
  color: red !important;
}
</style>
