<template>
  <img
    v-if="indexation?.pages.length"
    class="d-none"
    :src="indexation.pages[0].url"
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
          v-for="(page, index) in indexation!.pages"
          :key="`page-${index}`"
          class="page"
          :class="{ single: isSinglePage }"
        >
          <div class="page-content" :class="{ 'first-page': index === 0 }">
            <div
              class="page-image"
              :style="{
                backgroundImage: `url(${page.url})`,
                marginLeft: 0,
              }"
            >
              <div
                v-if="
                  showAiDetections !== undefined &&
                  xOffset !== undefined &&
                  displayRatioNoCropping &&
                  page.aiKumikoResults.length
                "
                class="position-absolute h-100"
                :style="{
                  left: `${xOffset || 0}px`,
                  width: `${displayedWidth! - (xOffset || 0)*2}px`,
                }"
              >
                <div
                  v-for="({ x, y, width, height }, idx) in page.aiKumikoResults"
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
                  :style="toPx(firstPanelPosition(page.url))"
                >
                  <div
                    v-for="(
                      { x1, x2, x3, x4, y1, y2, y3, y4 }, idx
                    ) in page.aiOcrResults || []"
                    :key="`ocr-match-${idx}`"
                    class="position-absolute ocr-match text"
                    :style="{
                      clipPath: `polygon(${[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                        .map(([x, y]) =>
                          (['width', 'height'] as const)
                            .map(
                              (dimension, idx) =>
                                `${
                                  [x, y][idx] /
                                  (page.aiKumikoResults[0][dimension] /
                                    100)
                                }%`
                            )
                            .join(' ')
                        )
                        .join(',')})`,
                    }"
                  >
                    {{
                      `polygon(${[
                        [x1, y1],
                        [x2, y2],
                        [x3, y3],
                        [x4, y4],
                      ]
                        .map(([x, y]) => `${x}% ${y}%`)
                        .join(",")})`
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

      <b-row>
        <b-col :cols="1" style="padding: 0">
          <b-row
            v-for="{id, pageNumber} in indexation!.pages"
            :key="id"
            style="height: 50px"
            :variant="currentPage === pageNumber ? 'secondary' : 'light'"
            class="g-0 px-0 py-0 align-items-center border"
          >
            <b-col rowspan="4" @click="currentPage = pageNumber"
              >Page {{ pageNumber }}<br /><b-button disabled variant="light"
                ><i-bi-scissors /></b-button
            ></b-col>
          </b-row>
        </b-col>
        <b-col
          :cols="1"
          class="position-relative border"
          :style="{ padding: 0 }"
        >
          <!-- <b-row
            v-for="pageNumber in numberOfPages"
            :key="pageNumber"
            style="height: 50px"
            :variant="currentPage === pageNumber ? 'secondary' : 'light'"
            class="g-0 px-0 py-0 align-items-center border position-relative"
          > -->
          <template v-for="entry in indexation!.entries" :key="entry.url">
            <!-- <vue-draggable-resizable
              class="position-absolute border-0"
              :parent="true"
              :y="50 * (idx + 1) - 1"
              :style="{
                height: '5px',
                width: '100%',
                cursor: 'ns-resize',
                zIndex: 50,
              }"
              axis="y"
              w="100%"
              h="5px"
              :resizable="false"
              :grid="[25, 25]"
              ><hr class="m-0"
            /></vue-draggable-resizable> -->
            <b-col
              :class="`w-100 kind-${acceptedStoryKinds[entry.id]?.kind}`"
              :style="{
                height: `${
                  50 *
                  (acceptedStories[entry.id]?.storyversion?.entirepages || 1)
                }px`,
              }"
              :title="`${entry.title} (${
                acceptedStories[entry.id]?.storyversion?.entirepages || 1
              } pages)`"
            ></b-col>
          </template>
        </b-col>
        <b-col :cols="10" style="padding: 0">
          <b-row
            v-for="(entry, idx) in indexation!.entries"
            :key="entry.id"
            :style="currentPage === idx ? {} : { height: '50px' }"
            :variant="currentPage === idx ? 'secondary' : 'light'"
            :class="`g-0 px-0 py-0 align-items-center border bg-${
              currentPage === idx ? 'secondary' : 'light'
            }`"
          >
            <b-col @click="currentPage = idx"
              ><Entry :entry="entry" :editable="currentPage === idx"
            /></b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";

import useAi from "~/composables/useAi";
import { suggestions } from "~/stores/suggestions";
import { user } from "~/stores/ui";

let ai: ReturnType<typeof useAi>;

const coverWidth = ref<number | null>(null);
let coverHeight = ref<number | null>(null);
let book = ref<PageFlip | null>(null);
const currentPage = ref(0);

defineProps<{ indexationId: string }>();

const { indexation, acceptedStoryKinds, acceptedStories } = storeToRefs(
  suggestions()
);

const { showAiDetectionsOn: showAiDetections } = user();

const isSinglePage = computed(() => indexation.value?.pages.length === 1);

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

const firstPanelPosition = (pageUrl: string) => {
  const { x, y, width, height } = indexation.value!.pages.find(
    ({ url }) => url === pageUrl
  )!.aiKumikoResults[0];
  return {
    left: x * displayRatioNoCropping.value!,
    top: y * displayRatioNoCropping.value!,
    width: width * displayRatioNoCropping.value!,
    height: height * displayRatioNoCropping.value!,
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

// watch(
//   () => storyversionKinds.value,
//   async () => {
//     ai = useAi(indexationId.value);
//     await ai.runCoverSearch();
//     await ai.runStorycodeOcr();
//     ai.status.value = "loaded";
//   },
//   { deep: true, immediate: true }
// );
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

.resize-handle {
  position: absolute;
  content: " ";
  cursor: ns-resize;
  bottom: 0;
  height: 11px;
  display: flex;
  background: red;
  width: 5px;
}
</style>
