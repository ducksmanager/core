<template>
  <b-container fluid class="p-2 border-bottom">
    <h2>DuMILi</h2>
    <h3>DucksManager Inducks Little helper</h3>
  </b-container>
  <b-container
    id="main"
    fluid
    class="d-flex flex-grow-1 flex-column overflow-y-auto"
  >
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
        Upload page files
      </b-button>
    </template>
    <Book v-else-if="tabNames[activeTab] === 'book'" />
    <TextEditor v-else-if="tabNames[activeTab] === 'text-editor'" />
  </b-container>
  <b-container class="start-0 bottom-0 mw-100 pt-2" style=""
    ><b-tabs v-model:modelValue="activeTab" align="center"
      ><b-tab title="Page gallery" /><b-tab title="Book" /><b-tab
        title="Text editor" /></b-tabs
  ></b-container>
</template>

<script setup lang="ts">
import { AxiosResponse } from "axios";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import {
  EntrySuggestion,
  StoryversionKind,
  StoryversionKindSuggestion,
  suggestions,
} from "~/stores/suggestions";
import { defaultApi } from "~/util/api";
const showUploadWidget = ref(false);
const route = useRoute();

const activeTab = ref(0);
const tabNames = ["page-gallery", "book", "text-editor"];

const { entrySuggestions, storyversionKindSuggestions } = storeToRefs(
  suggestions()
);
const images = computed(() =>
  Object.keys(entrySuggestions.value).map((url) => ({
    url: url,
    text: url,
  }))
);
const getPageImages = () => {
  defaultApi
    .get(
      `${import.meta.env.VITE_BACKEND_URL}/cloudinary/indexation/${
        route.params.id
      }`
    )
    .then((res: AxiosResponse<{ url: string }[]>) => {
      const urls = res.data.map(({ url }) => url.replace(/^http:/, "https:"));
      entrySuggestions.value = urls.reduce(
        (acc, url) => ({
          ...acc,
          [url]: [],
        }),
        {} as Record<string, EntrySuggestion[]>
      );
      storyversionKindSuggestions.value = urls.reduce(
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
        {} as Record<string, StoryversionKindSuggestion[]>
      );
    });
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
