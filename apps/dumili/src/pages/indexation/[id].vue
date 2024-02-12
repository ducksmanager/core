<template>
  <b-container style="max-height: calc(100% - 35px)" class="d-flex flex-column">
    <template v-if="tabNames[activeTab] === 'page-gallery'"
      ><Gallery :images="images" />
      <upload-widget
        v-if="showUploadWidget"
        :folder-name="route.params.id as string"
        @done="
          showUploadWidget = !showUploadWidget;
          getPageImages();
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
    <Book v-else-if="tabNames[activeTab] === 'book'" />
    <TextEditor v-else-if="tabNames[activeTab] === 'text-editor'"
  /></b-container>
  <b-container>
    <b-container
      v-if="activeTab !== undefined"
      class="start-0 bottom-0 mw-100 pt-2 h-5"
      style="height: : 35px"
      ><b-tabs v-model:modelValue="activeTab" align="center"
        ><b-tab :title="$t('Page gallery')" /><b-tab
          :title="$t('Book')" /><b-tab
          :title="$t('Text editor')" /></b-tabs></b-container
  ></b-container>
</template>

<script setup lang="ts">
import { getIndexationSocket } from "~/composables/useDumiliSocket";
import {
  StoryversionKind,
  StoryversionKindSuggestion,
  suggestions,
} from "~/stores/suggestions";
import { tabs } from "~/stores/tabs";
const showUploadWidget = ref(false);
const route = useRoute();

const { t: $t } = useI18n();

const { activeTab } = storeToRefs(tabs());
const { tabNames } = tabs();

const { entrySuggestions, storyversionKindSuggestions } = storeToRefs(
  suggestions()
);
const images = computed(() =>
  entrySuggestions.value.map(({ url }) => ({
    url,
    text: url,
  }))
);
const getPageImages = async () => {
  const indexationId = route.params.id as string;
  const data = await getIndexationSocket(indexationId).getIndexationResources();
  if ("error" in data) {
    console.error(data.error);
    return;
  }
  const urls = data.resources.map(({ url }) => url);
  entrySuggestions.value = urls.map((url) => ({
    url,
    suggestions: [],
  }));
  storyversionKindSuggestions.value = urls.reduce<
    Record<string, StoryversionKindSuggestion[]>
  >(
    (acc, url) => ({
      ...acc,
      [url]: Object.values(StoryversionKind).map(
        (key) =>
          new StoryversionKindSuggestion(
            { kind: key },
            {
              isAccepted: false,
              source: "default",
            }
          )
      ),
    }),
    {}
  );
};

(async () => {
  getPageImages();
})();
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
