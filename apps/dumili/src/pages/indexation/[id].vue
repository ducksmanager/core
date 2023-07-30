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
    <Book v-if="tabNames[activeTab] === 'book'" />
    <b-row v-if="tabNames[activeTab] === 'text-editor'">
      <b-col>
        <b-form-textarea
          v-model="textContent"
          :rows="Object.keys(entrySuggestions).length + 1"
          readonly
          :placeholder="textContentError"
      /></b-col>
    </b-row>
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

import { EntrySuggestion, issueDetails } from "~/stores/issueDetails";
import { defaultApi } from "~/util/api";
const showUploadWidget = ref(false);
const route = useRoute();

const activeTab = ref(0);
const tabNames = ["page-gallery", "book", "text-editor"];

const textContentError = ref("" as string);

const { entrySuggestions } = storeToRefs(issueDetails());
const issue = computed(() => issueDetails().issue);
const acceptedEntries = computed(() => issueDetails().acceptedEntries);
const images = computed(() =>
  Object.keys(entrySuggestions.value).map((url) => ({
    url: url,
    text: url,
  }))
);

watch(
  () => issue.value,
  () => {
    if (!issue.value) {
      textContentError.value = "No data";
    }
  }
);

const textContent = computed(() => {
  if (!issue.value) {
    return "";
  }
  const rows = [
    [issue.value?.issuecode],
    ...(
      Object.values(acceptedEntries.value).filter(
        (entry) => entry !== undefined
      ) as EntrySuggestion[]
    ).map((entry) => [
      entry.entrycode,
      entry.storyversion?.storyversioncode,
      String(entry.storyversion?.entirepages),
      ...["plot", "writer", "artist", "ink"].map(
        (job) =>
          entry.storyjobs?.find(({ plotwritartink }) => plotwritartink === job)
            ?.personcode
      ),
      entry.printedhero,
    ]),
  ];
  const colsMaxLengths = rows.reduce<number[]>((acc, row) => {
    row.forEach((col, i) => {
      acc[i] = Math.max(acc[i], col?.length || 0);
    });
    return acc;
  }, [] as number[]);

  return rows
    .map((row) =>
      row
        .map((col, colIndex) =>
          (col || "").padEnd(colsMaxLengths[colIndex], " ")
        )
        .join(" ")
    )
    .join("\n");
});

const getPageImages = () => {
  defaultApi
    .get(
      `${import.meta.env.VITE_BACKEND_URL}/cloudinary/indexation/${
        route.params.id
      }`
    )
    .then((res: AxiosResponse<{ url: string }[]>) => {
      entrySuggestions.value = res.data.reduce(
        (acc, { url }) => ({
          ...acc,
          [url.replace(/^http:/, "https:")]: [],
        }),
        {} as Record<string, EntrySuggestion[]>
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
