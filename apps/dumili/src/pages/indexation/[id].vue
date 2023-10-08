<template>
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
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import {
  EntrySuggestion,
  StoryversionKind,
  StoryversionKindSuggestion,
  suggestions,
} from "~/stores/suggestions";
import { tabs } from "~/stores/tabs";
import { defaultApi } from "~/util/api";
const showUploadWidget = ref(false);
const route = useRoute();

const activeTab = computed(() => tabs().activeTab!);
const tabNames = ["page-gallery", "book", "text-editor"];

const { entrySuggestions, storyversionKindSuggestions } = storeToRefs(
  suggestions(),
);
const images = computed(() =>
  Object.keys(entrySuggestions.value).map((url) => ({
    url: url,
    text: url,
  })),
);
const getPageImages = async () => {
  const urls = (
    await defaultApi.get<{ url: string }[]>(
      `${import.meta.env.VITE_BACKEND_URL}/cloudinary/indexation/${
        route.params.id
      }`,
    )
  ).data.map(({ url }) => url.replace(/^http:/, "https:"));
  entrySuggestions.value = urls.reduce(
    (acc, url) => ({
      ...acc,
      [url]: [],
    }),
    {} as Record<string, EntrySuggestion[]>,
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
            },
          ),
      ),
    }),
    {} as Record<string, StoryversionKindSuggestion[]>,
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
