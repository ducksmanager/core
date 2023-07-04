<template>
  <b-container fluid>
    <template v-if="tabNames[activeTab] === 'page-gallery'">
      <b-row v-if="images" align-h="center">
        <b-col
          class="col"
          v-for="image of images"
          :key="image.url"
          cols="12"
          md="4"
        >
          <b-img :src="image.url" fluid thumbnail />
        </b-col>
      </b-row>
      <b-container v-else>Loading...</b-container>
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
    <Book
      v-if="tabNames[activeTab] === 'book'"
      publicationcode="fr/SPG"
      issuenumber="1"
    />
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
  <b-container class="position-fixed start-0 bottom-0 mw-100" style=""
    ><b-tabs align="center" v-model:modelValue="activeTab"
      ><b-tab title="Page gallery" /><b-tab title="Book" /><b-tab
        title="Text editor" /></b-tabs
  ></b-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { defaultApi } from "../../util/api";
import { issueDetails } from "../../stores/issue";
import { AxiosResponse } from "axios";
const showUploadWidget = ref(false);
const route = useRoute();

const activeTab = ref(0);
const tabNames = ["page-gallery", "book", "text-editor"];

const textContentError = ref("" as string);

const issue = computed(() => issueDetails().issue);
const entries = computed(() => issueDetails().entries);

const textContent = computed(() => {
  if (!issue.value) {
    textContentError.value = "No data";
    return "";
  }
  const rows = [
    [issue.value.issuecode],
    ...entries.value.map((entry) => [
      entry.entrycode,
      entry.storyversioncode,
      String(entry.pages),
      entry.plot,
      entry.writer,
      entry.artist,
      entry.ink,
      entry.printedhero,
      `${entry.entrycomment} ${entry.extra}`,
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
      row.map((col, colIndex) =>
        (col || "").padEnd(colsMaxLengths[colIndex], " ")
      )
    )
    .join("\n");
});

const images = ref([] as { url: string }[]);

const getPageImages = () => {
  defaultApi
    .get(
      `${import.meta.env.VITE_BACKEND_URL}/cloudinary/folder/${route.params.id}`
    )
    .then((res: AxiosResponse<(typeof images)["value"]>) => {
      images.value = res.data;
    });
};

(async () => {
  getPageImages();
})();
</script>

<style lang="scss" scoped>
.col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control::placeholder {
  color: red !important;
}
</style>
