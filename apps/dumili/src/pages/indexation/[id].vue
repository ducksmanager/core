<template>
  <b-container fluid>
    <template v-if="tabNames[activeTab] === 'page-gallery'">
      <upload-widget
        v-if="showUploadWidget"
        @done="getPageImages()"
        @abort="showUploadWidget = !showUploadWidget"
      />
      <b-button
        v-show="!showUploadWidget"
        @click="showUploadWidget = !showUploadWidget"
      >
        Upload files
      </b-button>

      <b-row align-h="center">
        <b-col
          class="col"
          v-for="image of images"
          :key="image.toURL()"
          cols="12"
          md="4"
        >
          <b-img :src="image.toURL()" thumbnail fluid />
        </b-col>
      </b-row>
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
            :rows="(issue?.entries?.length || 0) + 1"
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
import { CloudinaryImage } from "@cloudinary/url-gen/assets/CloudinaryImage";
import { defaultApi } from "../../util/api";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUDNAME;
const showUploadWidget = ref(false);

const activeTab = ref(0);
const tabNames = ["page-gallery", "book", "text-editor"];

type Entry = {
  entrycode: string;
  storycode: string;
  pages: number | "0q" | "0+";
  plot: string;
  writer: string;
  artist: string;
  ink: string;
  hero: string;
  description: string;
  extra: string;
};

type Issue = {
  issuecode: string;
  indexer: string;
  issuedate: string;
  price?: string;
  pages: number;
  publisher: string;
  entries: Entry[];
};

const issue = ref(null as Issue | null);
const textContentError = ref("" as string);

const textContent = computed(() => {
  if (!issue.value) {
    textContentError.value = "No data";
    return "";
  }
  const rows = [
    [issue.value.issuecode],
    ...issue.value.entries.map((entry) => [
      entry.entrycode,
      entry.storycode,
      String(entry.pages),
      entry.plot,
      entry.writer,
      entry.artist,
      entry.ink,
      entry.hero,
      `${entry.description} ${entry.extra}`,
    ]),
  ];
  const colsMaxLengths = rows.reduce<number[]>((acc, row) => {
    row.forEach((col, i) => {
      acc[i] = Math.max(acc[i], col.length);
    });
    return acc;
  }, [] as number[]);

  return rows
    .map((row) =>
      row.map((col, colIndex) => col.padEnd(colsMaxLengths[colIndex], " "))
    )
    .join("\n");
});

const images = ref([
  new CloudinaryImage("logo", { cloudName }, { analytics: false }),
  new CloudinaryImage("dumili/btn-agenda", { cloudName }, { analytics: false }),
] as CloudinaryImage[]);

const getPageImages = () => {
  showUploadWidget.value = !showUploadWidget.value;
};

defaultApi.get("http://localhost:3001/cloudinary/folder").then((res) => {
  console.log(res.data);
});
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
