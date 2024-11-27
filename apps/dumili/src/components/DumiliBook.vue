<template>
  <Book
    v-if="coverRatio"
    v-model:book="book"
    v-model:current-page="currentPage"
    v-model:opened="isBookOpened"
    :cover-ratio="coverRatio"
    :pages="indexation.pages"
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
</template>

  <script setup lang="ts">
import { components as webComponents, type PageFlip } from "~web";
import { getEntryPages } from "~dumili-utils/entryPages";
import type { FullIndexation } from "~dumili-services/indexation/types";
import type { aiKumikoResultPanel, aiOcrResult } from "~prisma/client_dumili";
import { ref } from "vue";
import { ui } from "~/stores/ui";

const { Book } = webComponents;

const { indexation, firstPageDimensions } = defineProps<{
  indexation: FullIndexation;
  firstPageDimensions: { width: number; height: number };
}>();

const {
  hoveredEntry,
  hoveredEntryPageNumbers,
  currentPage,
  visiblePages,
  showAiDetectionsOn,
} = storeToRefs(ui());

const book = ref<PageFlip>();
const isBookOpened = ref(true);

defineEmits<{
  "update:book": [value: PageFlip | undefined];
  "update:currentPage": [value: number];
  "update:opened": [value: boolean];
}>();

watch(
  [() => book.value?.getPageCollection(), currentPage],
  ([pageCollection, currentPage]) => {
    if (pageCollection) {
      visiblePages.value = new Set(
        [currentPage, pageCollection.getCurrentSpreadIndex() * 2].map(
          (pageIndex) => indexation.pages[pageIndex].id,
        ),
      );
    }
  },
);

const coverRatio = computed(
  () => firstPageDimensions.height / firstPageDimensions.width,
);

const getPanelCss = (panel: aiKumikoResultPanel) => {
  const { width: pageWidth, height: pageHeight } = firstPageDimensions!;
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
    pageElement.clientWidth / firstPageDimensions!.width;
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
</script>