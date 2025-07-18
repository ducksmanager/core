<template>
  <Book
    v-if="coverRatio"
    v-model:book="book"
    v-model:current-page="currentPage"
    v-model:opened="isBookOpened"
    :cover-ratio="coverRatio"
    :pages="indexation.pages"
  >
    <template v-if="overlay" #page-overlay="{ index, page }">
      <template
        v-if="
          overlay.type === 'story kind' &&
          getEntryPages(indexation, overlay.entryId)
            .map(({ id }) => id)
            .includes(page.id)
        "
      >
        <div
          :class="`overlay kind-${getEntryFromPage(indexation, page.id)!.acceptedStoryKind?.storyKindRows.kind} striped`"
        ></div>
      </template>
      <template v-if="overlay && page.image && visiblePages.has(page.id)">
        <template
          v-if="
            overlay.type === 'panels' &&
            (('pageId' in overlay && overlay.pageId === page.id) ||
              ('entryId' in overlay &&
                getEntryPages(indexation, overlay.entryId).includes(page)))
          "
        >
          <div
            v-for="panel in page.image.aiKumikoResult?.detectedPanels || []"
            :key="`kumiko-match-${panel.id}`"
            class="overlay translucent"
            :style="getPanelCss(panel, page.image.url)"
          ></div>
        </template>
        <template
          v-if="
            overlay.type === 'ocr' &&
            getEntryPages(indexation, overlay.entryId).includes(page)
          "
        >
          <div
            v-for="ocrDetection of page.image.aiOcrResult?.matches || []"
            :key="`ocr-match-${ocrDetection.id}`"
            class="position-absolute ocr-match text w-100 h-100"
            :style="getOcrDetectionCss(ocrDetection, index)"
          >
            {{ ocrDetection.text }}
          </div></template
        >
      </template>
    </template>
  </Book>
</template>

<script setup lang="ts">
import { type PageFlip, components as webComponents } from "~web";
import { getEntryFromPage, getEntryPages } from "~dumili-utils/entryPages";
import type { FullIndexation } from "~dumili-services/indexation";
import type {
  aiKumikoResultPanel,
  aiOcrResultMatch,
} from "~prisma/client_dumili/client";
import { ref } from "vue";
import { ui } from "~/stores/ui";

const { Book } = webComponents;

const { indexation, firstPageDimensions } = defineProps<{
  indexation: FullIndexation;
  firstPageDimensions: { width: number; height: number };
}>();

const { currentPage, visiblePages, overlay } = storeToRefs(ui());

const book = ref<PageFlip>();
const isBookOpened = ref(true);
const pageDimensions = ref<Record<string, { width: number; height: number }>>(
  {},
);

defineEmits<{
  "update:book": [value: PageFlip | undefined];
  "update:currentPage": [value: number];
  "update:opened": [value: boolean];
}>();

watch(visiblePages, () => {
  for (const pageId of visiblePages.value || []) {
    const pageIndex = indexation.pages.findIndex(({ id }) => id === pageId);
    if (indexation.pages[pageIndex].image) {
      const img = new Image();
      img.src = indexation.pages[pageIndex].image!.url;

      img.onload = () => {
        pageDimensions.value[indexation.pages[pageIndex].image!.url] = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
      };
    }
  }
});

const coverRatio = computed(
  () => firstPageDimensions.height / firstPageDimensions.width,
);

const getPanelCss = (panel: aiKumikoResultPanel, pageUrl: string) => {
  const { width: pageWidth, height: pageHeight } =
    pageDimensions.value[pageUrl]!;
  const { x, y, width, height } = panel;
  return {
    left: `${(x * 100) / pageWidth}%`,
    top: `${(y * 100) / pageHeight}%`,
    width: `${(width * 100) / pageWidth}%`,
    height: `${(height * 100) / pageHeight}%`,
  };
};

const getOcrDetectionCss = (
  { x1, x2, y1, y2 }: aiOcrResultMatch,
  bookPageIndex: number,
) => {
  const pageElement = (
    book.value!.getPage(bookPageIndex) as unknown as { element: HTMLDivElement }
  ).element;

  const naturalImageWidth =
    pageDimensions.value[indexation.pages[bookPageIndex].image!.url]!.width;
  const naturalToRenderedRatio = pageElement.clientWidth / naturalImageWidth;
  return {
    clipPath: `polygon(${[
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
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