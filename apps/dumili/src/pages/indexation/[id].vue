<template>
  <b-row v-if="indexationId && hasData" class="d-flex h-100">
    <b-col :cols="6" class="d-flex flex-column h-100">
      <template v-if="activeTab === 'pageGallery'"
        ><Gallery :images="images" />
        <upload-widget
          v-if="showUploadWidget"
          :folder-name="indexationId"
          @done="
            showUploadWidget = !showUploadWidget;
            loadIndexation(indexationId);
          "
          @abort="showUploadWidget = !showUploadWidget"
        />
        <b-button
          v-show="!showUploadWidget"
          @click="showUploadWidget = !showUploadWidget"
        >
          {{ $t("Envoyer des images de pages") }}
        </b-button>
      </template>
      <Book
        v-else-if="activeTab === 'book' && coverRatio"
        ref="bookComponent"
        v-model:book="book"
        v-model:current-page="bookCurrentPage"
        v-model:opened="isBookOpened"
        :cover-ratio="coverRatio"
        :urls="indexation.pages.map(({ url }) => url)"
      >
        <template #page-overlay="{ index }"
          ><div
            :class="`overlay ${
              hoveredEntryPageNumbers?.includes(index + 1)
                ? `kind-${hoveredEntry!.acceptedStoryKind?.kind} striped`
                : ''
            }`"
          ></div
        ></template>
      </Book>
      <TextEditor v-else-if="activeTab === 'textEditor'" />
      <b-container
        v-if="activeTab !== undefined"
        class="start-0 bottom-0 mw-100 pt-2 h-5"
        style="height: 35px"
        ><b-tabs v-model:model-value="activeTabIndex" align="center"
          ><b-tab
            v-for="tabName of tabNames"
            :key="tabName"
            :title="$t(tabName)" /></b-tabs></b-container
    ></b-col>

    <b-col :cols="6" class="h-100 overflow-auto">
      <table-of-contents
        v-model="bookCurrentPage"
        :indexation="indexation"
        :shown-pages="shownPages"
    /></b-col>
  </b-row>
</template>

<script setup lang="ts">
import { components as webComponents, type PageFlip } from "~web";
import { suggestions } from "~/stores/suggestions";
import { tabs } from "~/stores/tabs";
import { ui } from "~/stores/ui";
import { FullIndexation } from "~dumili-services/indexation/types";

const { Book } = webComponents;

const book = ref<PageFlip | undefined>(undefined);
const bookCurrentPage = ref(0);
const isBookOpened = ref(true);
const coverRatio = ref<number | undefined>(undefined);

const showUploadWidget = ref(false);
const route = useRoute();

const { t: $t } = useI18n();

const { hoveredEntry, hoveredEntryPageNumbers } = storeToRefs(ui());
const { activeTab } = storeToRefs(tabs());
const activeTabIndex = computed({
  get() {
    return Object.keys(tabs().tabNames).indexOf(activeTab.value);
  },

  set(value) {
    tabs().activeTab = Object.keys(tabs().tabNames)[
      value
    ] as typeof activeTab.value;
  },
});

const { tabNames } = tabs();

const { fetchPublicationNames, fetchStoryDetails, fetchStoryversionDetails } =
  coa();
const { storyDetails } = storeToRefs(coa());

const indexationId = ref<string | null>(null);

const { loadIndexation } = suggestions();
const { indexation } = storeToRefs(suggestions()) as {
  indexation: Ref<FullIndexation>;
};

const hasData = ref(false);

const shownPages = computed(() =>
  book.value?.getPageCollection()
    ? [
        ...new Set([
          bookCurrentPage.value,
          book.value!.getPageCollection().getCurrentSpreadIndex() * 2,
        ]),
      ]
    : [],
);

const images = computed(() =>
  indexation.value?.pages.map(({ url }) => ({
    url,
    text: url,
  })),
);

watch(
  () => route.params.id,
  async (id) => {
    indexationId.value = id as string;
    await loadIndexation(indexationId.value);
    await fetchPublicationNames(
      indexation.value.issueSuggestions.map(
        ({ publicationcode }) => publicationcode,
      ),
    );
    await fetchStoryDetails(
      indexation
        .value!.entries.map(({ storySuggestions }) =>
          storySuggestions.map(({ storycode }) => storycode),
        )
        .flat(),
    );
    await fetchStoryversionDetails(
      indexation
        .value!.entries.map(({ storySuggestions }) =>
          storySuggestions.map(
            ({ storycode }) =>
              storyDetails.value[storycode]!.originalstoryversioncode!,
          ),
        )
        .flat(),
    );
    const firstPageDimensions: { output: { height: number; width: number } } =
      await (
        await fetch(
          "https://res.cloudinary.com/dl7hskxab/image/upload/pg_1/fl_getinfo/v1729876637/dumili/brunoperel/20241025T171702824/Picsou_magazine_529_11zon_krzady.png",
        )
      ).json();
    coverRatio.value =
      firstPageDimensions.output.height / firstPageDimensions.output.width;
    hasData.value = true;
  },
  { immediate: true },
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

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
