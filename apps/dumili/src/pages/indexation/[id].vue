<template>
  <b-row v-if="indexationId && hasData" class="d-flex h-100">
    <b-col :cols="6" class="d-flex flex-column h-100">
      <template v-if="activeTab === 'pageGallery'">
        <Gallery :images="images" />
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
        :pages="indexation.pages"
        :re-render="reRenderNumber"
      >
        <template #page-overlay="{ index, page }">
          <template v-if="hoveredEntryPageNumbers?.includes(index + 1)">
            <div
              :class="`overlay kind-${hoveredEntry!.acceptedStoryKind?.kind} striped`"
            ></div>
          </template>
          <template
            v-if="
              showAiDetectionsOn?.type === 'page' &&
              showAiDetectionsOn.id === page.id
            "
          >
            <div
              v-for="panel in page.aiKumikoResultPanels"
              :key="`kumiko-match-${panel.id}`"
              class="overlay translucent"
              :style="getPanelCss(panel)"
            ></div>
          </template>
          <template
            v-if="
              showAiDetectionsOn?.type === 'entry' &&
              getEntryPages(indexation, showAiDetectionsOn.id).includes(page)
            "
          >
            <div
              v-for="ocrDetection of page.aiOcrResults || []"
              :key="`ocr-match-${ocrDetection.id}`"
              class="position-absolute ocr-match text w-100 h-100"
              :style="getOcrDetectionCss(ocrDetection, index + 1)"
            >
              {{ ocrDetection.text }}
            </div>
          </template>
        </template>
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
            :title="$t(tabName)" /></b-tabs
      ></b-container>
    </b-col>

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
import { aiKumikoResultPanel, aiOcrResult } from "~prisma/client_dumili";
import { getEntryPages } from "~dumili-utils/entryPages";

const { Book } = webComponents;

const book = ref<PageFlip | undefined>(undefined);
const bookCurrentPage = ref(0);
const isBookOpened = ref(true);
const reRenderNumber = ref();

const showUploadWidget = ref(false);
const route = useRoute();

const { t: $t } = useI18n();

const { hoveredEntry, hoveredEntryPageNumbers, showAiDetectionsOn } =
  storeToRefs(ui());
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

watch(
  activeTab,
  () => {
    if (activeTab.value === "book") {
      book.value = undefined;
    }
  },
  { immediate: true },
);

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

const firstPageDimensions = ref<{ width: number; height: number } | null>(null);

const coverRatio = computed(() =>
  firstPageDimensions.value
    ? firstPageDimensions.value.height / firstPageDimensions.value.width
    : null,
);

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

const getPanelCss = (panel: aiKumikoResultPanel) => {
  const { width: pageWidth, height: pageHeight } = firstPageDimensions.value!;
  const { x, y, width, height } = panel;
  return {
    left: `${(x * 100) / pageWidth}%`,
    top: `${(y * 100) / pageHeight}%`,
    width: `${(width * 100) / pageWidth}%`,
    height: `${(height * 100) / pageHeight}%`,
  };
};

const getOcrDetectionCss = (
  { x1, x2, x3, x4, y1, y2, y3, y4 }: aiOcrResult,
  bookPageIndex: number,
) => {
  const pageElement = (
    book.value!.getPage(bookPageIndex) as unknown as { element: HTMLDivElement }
  ).element;
  const naturalToRenderedRatio =
    pageElement.clientWidth / firstPageDimensions.value!.width;
  return {
    clipPath: `polygon(${[
      [x1, y1],
      [x2, y2],
      [x3, y3],
      [x4, y4],
    ]
      .map(([x, y]) =>
        (["width", "height"] as const)
          .map((_, idx) => `${[x, y][idx] * naturalToRenderedRatio}px`)
          .join(" "),
      )
      .join(",")})`,
  };
};

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
    const storycodes = indexation
      .value!.entries.map(({ storySuggestions }) =>
        storySuggestions
          .map(({ storycode }) => storycode)
          .filter((v): v is string => !!v),
      )
      .flat();
    await fetchStoryDetails(storycodes);
    await fetchStoryversionDetails(
      storycodes
        .map(
          (storycode) =>
            storyDetails.value[storycode]?.originalstoryversioncode,
        )
        .filter((v): v is string => !!v),
    );
    const { output }: { output: { height: number; width: number } } = await (
      await fetch(
        indexation.value.pages[0].url.replace("pg_1/", "pg_1/fl_getinfo/"),
      )
    ).json();
    firstPageDimensions.value = output;
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
