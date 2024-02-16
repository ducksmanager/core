<template>
  <img
    v-if="entrySuggestions.length"
    class="d-none"
    :src="entrySuggestions[0].url"
    @load="
      ({ target }) => {
        coverHeight = (target as HTMLImageElement).height;
        coverWidth = (target as HTMLImageElement).width;
      }
    "
  />
  <div
    id="book-and-toc-container"
    class="start-0 top-0 d-flex flex-row align-items-center justify-content-space-around"
  >
    <b-container class="book-container d-flex w-50 h-100 m-0">
      <div id="book" class="flip-book">
        <div
          v-for="(entry, index) in entrySuggestions"
          :key="`page-${index}`"
          class="page"
          :class="{ single: isSinglePage }"
        >
          <div class="page-content" :class="{ 'first-page': index === 0 }">
            <div
              class="page-image"
              :style="{
                backgroundImage: `url(${entry.url})`,
                marginLeft: 0,
              }"
            >
              <div
                v-if="
                  showAiDetections !== undefined &&
                  xOffset !== undefined &&
                  displayRatioNoCropping &&
                  aiDetails[entry.url].panels?.length
                "
                class="position-absolute h-100"
                :style="{
                  left: `${xOffset || 0}px`,
                  width: `${displayedWidth! - (xOffset || 0)*2}px`,
                }"
              >
                <div
                  v-for="({ bbox: { x, y, width, height } }, idx) in aiDetails[
                    entry.url
                  ].panels"
                  :key="`ocr-match-${idx}`"
                  class="position-absolute ocr-match panel"
                  :style="{
                    left: `${x * displayRatioNoCropping}px`,
                    top: `${y * displayRatioNoCropping}px`,
                    width: `${width * displayRatioNoCropping}px`,
                    height: `${height * displayRatioNoCropping}px`,
                  }"
                ></div>
                <div
                  class="position-absolute"
                  :style="toPx(firstPanelPosition(entry.url))"
                >
                  <div
                    v-for="({ box }, idx) in aiDetails[entry.url].texts
                      ?.ocrResults || []"
                    :key="`ocr-match-${idx}`"
                    class="position-absolute ocr-match text"
                    :style="{
                      clipPath: `polygon(${box
                        .map(([x, y]) =>
                          (['width', 'height'] as const)
                            .map(
                              (dimension, idx) =>
                                `${
                                  [x, y][idx] /
                                  (aiDetails[entry.url].panels[0].bbox[dimension] /
                                    100)
                                }%`
                            )
                            .join(' ')
                        )
                        .join(',')})`,
                    }"
                  >
                    {{
                      `polygon(${box.map(([x, y]) => `${x}% ${y}%`).join(",")})`
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-container>
    <b-card
      no-body
      class="table-of-contents d-flex w-50 h-100 m-0 overflow-auto"
      body-class="flex-grow-1 w-100 h-100"
    >
      <template #header>
        <IssueSuggestionModal />
        <IssueSuggestionList />
        <div>
          <b-button
            variant="success"
            pill
            class="ms-2 hint"
            :disabled="!ai || ai.status.value === 'loading'"
            :class="ai?.status"
            @click="ai.runKumiko()"
          >
            <i-bi-lightbulb-fill
          /></b-button></div
      ></template>

      <b-table-simple
        class="flex-grow-1 nav nav-pills flex-column me-3 card-header-tabs w-100 h-100"
      >
        <b-tbody style="display: table">
          <template v-for="pageNumber in numberOfPages" :key="pageNumber">
            <b-tr
              v-for="sectionPart in 4"
              :key="sectionPart"
              :variant="currentPage === pageNumber ? 'secondary' : 'light'"
              class="g-0 px-0 py-0 align-items-left"
            >
              <b-th
                v-if="sectionPart % 4 === 1"
                style="vertical-align: middle"
                rowspan="4"
                @click="currentPage = pageNumber"
                >Page {{ pageNumber }}</b-th
              >
              <b-td
                :class="`kind-${
                  acceptedStoryversionKinds[
                    Object.keys(acceptedStoryversionKinds)[pageNumber - 1]
                  ]?.data.kind
                }`"
                :title="
                  acceptedEntries[
                    Object.keys(acceptedStoryversionKinds)[pageNumber - 1]
                  ]?.data.title
                "
              ></b-td
              ><b-td v-if="sectionPart % 4 === 1" rowspan="4">
                <Entry
                  :entryurl="
                    Object.keys(acceptedStoryversionKinds)[pageNumber - 1]
                  "
                  :editable="currentPage === pageNumber" /></b-td></b-tr
          ></template>
        </b-tbody>
      </b-table-simple>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";

import useAi from "~/composables/useAi";
import { ai as aiStore } from "~/stores/ai";
import { suggestions } from "~/stores/suggestions";
import { user } from "~/stores/ui";

const route = useRoute();
let ai: ReturnType<typeof useAi>;
const { aiDetails } = storeToRefs(aiStore());

const coverWidth = ref<number | null>(null);
let coverHeight = ref<number | null>(null);
let book = ref<PageFlip | null>(null);
const currentPage = ref(0);
const numberOfPages = ref(9);

const {
  storyversionKindSuggestions,
  acceptedStoryversionKinds,
  acceptedEntries,
  entrySuggestions,
} = storeToRefs(suggestions());

const { showAiDetectionsOn: showAiDetections } = user();

const indexationId = computed(() => route.params.id as string);
const isSinglePage = computed(() => entrySuggestions.value.length === 1);

const displayedWidth = computed(() => book.value?.getSettings().width);
const displayedHeight = computed(() => book.value?.getSettings().height);

const xOffset = computed(
  () =>
    displayedHeight.value &&
    pageRatio.value &&
    displayedWidth.value &&
    (displayedWidth.value - displayedHeight.value * pageRatio.value) / 2
);

const pageRatio = computed(() => coverWidth.value! / coverHeight.value!);

const displayRatioNoCropping = computed(
  () =>
    displayedHeight.value &&
    coverHeight.value &&
    displayedHeight.value / coverHeight.value
);

const firstPanelPosition = (url: string) => {
  const { bbox } = aiDetails.value[url].panels[0];
  return {
    left: bbox.x * displayRatioNoCropping.value!,
    top: bbox.y * displayRatioNoCropping.value!,
    width: bbox.width * displayRatioNoCropping.value!,
    height: bbox.height * displayRatioNoCropping.value!,
  };
};

const toPx = (position: Record<string, number>) =>
  Object.entries(position).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: `${value}px`,
    }),
    {}
  );

watch(
  () => currentPage.value,
  (newValue) => {
    if (book.value) {
      book.value.flip(newValue);
    }
  }
);

watch(
  () => coverWidth.value,
  (newValue) => {
    const availableWidthPerPage = document.body.clientWidth / 2 - 15;
    if (newValue && newValue > availableWidthPerPage) {
      coverHeight.value! /= newValue / availableWidthPerPage;
    }
  }
);

watch(
  () => coverWidth.value && coverHeight.value,
  (hasCoverDimensions) => {
    if (hasCoverDimensions) {
      const bookContainer = document.querySelector(".book-container")!;
      book.value = new PageFlip(
        document.getElementById("book") as HTMLElement,
        {
          width: Math.min(bookContainer.clientWidth / 2, coverWidth.value!),
          height: Math.min(bookContainer.clientHeight, coverHeight.value!),
          maxShadowOpacity: 0.5,
          showCover: true,
          usePortrait: false,
          mobileScrollSupport: false,
        }
      );
      book.value.loadFromHTML(document.querySelectorAll(".page"));

      book.value.on("flip", ({ data }) => {
        currentPage.value = parseInt(data.toString());
      });
    }
  },
  { immediate: true }
);

watch(
  () => storyversionKindSuggestions.value,
  async () => {
    ai = useAi(indexationId.value);
    await ai.runCoverSearch();
    await ai.runStorycodeOcr();
    ai.status.value = "loaded";
  },
  { deep: true, immediate: true }
);
</script>

<style scoped lang="scss">
:deep(.drag-handle) {
  cursor: grab;
}

#book-and-toc-container {
  height: 100%;
}

@keyframes pulse-yellow {
  0% {
    color: #999;
  }
  50% {
    color: yellow;
  }
  100% {
    color: #999;
  }
}

.table-of-contents {
  background-color: #eee;
  color: black;
  white-space: nowrap;

  .hint {
    svg {
      color: #999;
    }
    &:hover,
    &.loaded {
      svg {
        color: yellow;
      }
    }
    &.loading {
      svg {
        animation: pulse-yellow 2s infinite;
      }
    }
  }

  .card-header {
    text-align: center;

    :deep(a),
    :deep(h6) {
      color: #666;
    }

    h3 {
      margin: 6px 6px 0 6px;
      text-align: center;
    }
  }

  .col-auto {
    width: 100%;
  }

  :deep(ul) {
    overflow-x: auto;
  }

  :deep(.tab-content) {
    display: none;
  }
}

.flip-book {
  max-width: 100% !important;
  margin: auto;
  background-size: cover;
}

.page {
  color: #785e3a;

  overflow: hidden;

  .page-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
    background: white;

    .page-image {
      height: 100%;
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
    }

    &.first-page {
      background: transparent;

      .page-image {
        transform: rotate3d(0, 1, 0, -90deg);
        transform-origin: left;
        transition: all 1s linear;

        transform: rotate3d(0, 1, 0, 0deg);
      }
    }
  }

  &.--left {
    // for left page (property will be added automatically)
    border-right: 0;

    .page-image {
      box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
    }
  }

  &.--right {
    // for right page (property will be added automatically)
    border-left: 0;

    .page-image {
      box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);
    }
  }

  &.hard {
    // for hard page
    background-color: #f2e8d9;
  }

  &.page-cover {
    background-color: #e3d0b5;
    color: #785e3a;
  }

  &.single {
    left: initial !important;
    right: 0 !important;
  }

  .ocr-match {
    border: 1px solid red;

    &.text {
      background: rgba(0, 0, 0, 0.4);
      width: 100%;
      height: 100%;
    }
  }
}

td {
  vertical-align: middle;
}
</style>
