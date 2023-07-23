<template>
  <b-container fluid class="p-2 border-bottom">
    <h2>DuMILi</h2>
    <h3>DucksManager Inducks Little helper</h3>
  </b-container>
  <b-container
    fluid
    class="d-flex flex-grow-1 flex-column overflow-y-auto"
    id="main"
  >
    <template v-if="tabNames[activeTab] === 'page-gallery'"
      ><Gallery :images="images" />
      <upload-widget
        v-if="showUploadWidget"
        :folder-name="(route.params.id as string)"
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
    <template v-if="tabNames[activeTab] === 'text-editor'">
      <b-row>
        <b-col>
          <b-form-textarea
            :rows="entries.length + 1"
            readonly
            :placeholder="textContentError"
            v-model="textContent"
        /></b-col>
      </b-row>
    </template>
  </b-container>
  <b-container class="start-0 bottom-0 mw-100 pt-2" style=""
    ><b-tabs align="center" v-model:modelValue="activeTab"
      ><b-tab title="Page gallery" /><b-tab title="Book" /><b-tab
        title="Text editor" /></b-tabs
  ></b-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { defaultApi } from "~/util/api";
import { issueDetails } from "~/stores/issueDetails";
import { AxiosResponse } from "axios";
const showUploadWidget = ref(false);
const route = useRoute();

const activeTab = ref(0);
const tabNames = ["page-gallery", "book", "text-editor"];

const textContentError = ref("" as string);

const issue = computed(() => issueDetails().issue);
const entries = computed(() => issueDetails().entries);
const images = computed(() =>
  entries.value?.map(({ url, entrycode }) => ({
    url: url.url,
    text: entrycode,
  }))
);

const textContent = computed(() => {
  if (!issue.value) {
    textContentError.value = "No data";
    return "";
  }
  const rows = [
    [issue.value?.issuecode],
    ...entries.value.map((entry) => [
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
      issueDetails().entries = res.data.map(({ url }) => ({ url: { url } }));
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
