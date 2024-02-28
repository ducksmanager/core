<template>
  <template v-if="indexation">
    <img
      v-if="indexation.pages.length"
      class="d-none"
      :src="indexation.pages[0].url"
      @load="
      ({ target }) => {
        coverHeight = (target as HTMLImageElement).naturalHeight;
        coverWidth = (target as HTMLImageElement).naturalWidth;
      }
    "
    />
    <div
      class="start-0 top-0 h-100 d-flex flex-row align-items-center justify-content-space-around"
    >
      <b-container class="book-container d-flex w-50 h-100 m-0">
        <div id="book" class="flip-book">
          <div
            v-for="(page, index) in indexation.pages"
            ref="pageRefs"
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
                <template v-if="displayRatioCropped && naturalToDisplayRatio">
                  <div
                    v-for="(shownPage, idx) in shownPages.map(
                      (pageIdx) => indexation!.pages[pageIdx]
                    )"
                    :key="shownPage.url"
                    :class="`position-absolute start-${idx * 100}`"
                    :style="{
                      width: `${displayedWidthNoBackground!}px`,
                      height: `${displayedHeightNoBackground!}px`
                    }"
                  >
                    <div
                      v-for="{
                        id,
                        x,
                        y,
                        width,
                        height,
                      } in shownPage.aiKumikoResultPanels"
                      :key="`kumiko-match-${id}`"
                      class="position-absolute kumiko-match panel"
                      :style="{
                        left: `${
                          (x * displayRatioCropped) / naturalToDisplayRatio
                        }px`,
                        top: `${
                          (y * displayRatioCropped) / naturalToDisplayRatio
                        }px`,
                        width: `${
                          (width * displayRatioCropped) / naturalToDisplayRatio
                        }px`,
                        height: `${
                          (height * displayRatioCropped) / naturalToDisplayRatio
                        }px`,
                      }"
                    ></div>
                    <div
                      class="position-absolute"
                      :style="toPx(firstPanelPosition(shownPage.url))"
                    >
                      <div
                        v-for="{
                          id,
                          x1,
                          x2,
                          x3,
                          x4,
                          y1,
                          y2,
                          y3,
                          y4,
                        } in shownPage.aiOcrResults || []"
                        :key="`ocr-match-${id}`"
                        class="position-absolute ocr-match text"
                        :style="{
                      clipPath: `polygon(${[[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                        .map(([x, y]) =>
                          (['width', 'height'] as const)
                            .map(
                              (dimension, idx) =>
                                `${
                                  [x, y][idx] /
                                  (shownPage.aiKumikoResultPanels[0][dimension] /
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
                  </div></template
                >
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
              v-for="{
                id,
                pageNumber,
                aiKumikoResultPanels,
              } in indexation.pages"
              :key="id"
              style="height: 50px"
              :variant="currentPage === pageNumber ? 'secondary' : 'light'"
              class="g-0 px-0 py-0 align-items-center border"
            >
              <b-col
                role="button"
                :class="{
                  'fw-bold': shownPages.includes(pageNumber - 1),
                }"
                @click="currentPage = pageNumber - 1"
                >Page {{ pageNumber }}<br /><b-button disabled variant="light"
                  ><i-bi-scissors
                /></b-button>
                <table-tooltip
                  :target="`ai-results-page-${pageNumber}`"
                  :data="aiKumikoResultPanels" />
                <i-bi-info-circle-fill
                  :id="`ai-results-page-${pageNumber}`"
                  @click.stop="() => {}"
              /></b-col>
            </b-row>
          </b-col>
          <b-col :cols="1" class="position-relative p-0">
            <!-- <b-row
            v-for="pageNumber in numberOfPages"
            :key="pageNumber"
            style="height: 50px"
            :variant="currentPage === pageNumber ? 'secondary' : 'light'"
            class="g-0 px-0 py-0 align-items-center border position-relative"
          > -->
            <template v-for="entry in indexation.entries" :key="entry.url">
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
                  height: `${50 * entry.entryPages.length}px`,
                }"
                :title="`${entry.title || 'Inconnu'} (${
                  entry.entryPages.length
                } pages)`"
              ></b-col>
            </template>
          </b-col>
          <b-col :cols="10" class="d-flex flex-column" style="padding: 0">
            <b-row
              v-for="(entry, idx) in indexation.entries"
              :key="entry.id"
              :style="currentPage === idx ? {} : { height: '50px' }"
              class="flex-grow-1 g-0 px-0 py-0 align-items-top border bg-light"
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
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";

import useAi from "~/composables/useAi";
import { suggestions } from "~/stores/suggestions";

const coverWidth = ref<number | null>(null);
let coverHeight = ref<number | null>(null);
let book = ref<PageFlip | null>(null);
const currentPage = ref(0);

const props = defineProps<{ indexationId: string }>();
const { indexationId } = toRefs(props);

let ai = useAi(indexationId.value);

const { indexation, acceptedStoryKinds } = storeToRefs(suggestions());

const pageRefs = ref<HTMLDivElement[]>([]);

const isSinglePage = computed(() => indexation.value?.pages.length === 1);

const displayedWidth = computed(() => book.value?.getSettings().width);
const displayedHeight = computed(() => book.value?.getSettings().height);

const naturalAspectRatio = computed(
  () =>
    coverWidth.value &&
    coverHeight.value &&
    coverWidth.value / coverHeight.value
);

const displayedHeightNoBackground = computed(() =>
  naturalAspectRatio.value
    ? naturalAspectRatio.value < 1
      ? displayedHeight.value
      : displayedHeight.value! / naturalAspectRatio.value
    : null
);

console.log(displayedHeightNoBackground.value);

const displayedWidthNoBackground = computed(() =>
  naturalAspectRatio.value
    ? naturalAspectRatio.value > 1
      ? displayedWidth.value
      : displayedWidth.value! * naturalAspectRatio.value
    : null
);

console.log(displayedWidthNoBackground.value);

console.log(naturalAspectRatio.value);

const shownPages = computed(() =>
  book.value
    ? [
        ...new Set([
          book.value.getCurrentPageIndex(),
          (book.value as unknown as { pages: { currentSpreadIndex: number } })!
            .pages.currentSpreadIndex * 2,
        ]),
      ]
    : []
);

const displayRatioCropped = computed(
  () =>
    displayedHeight.value &&
    coverHeight.value &&
    displayedHeight.value / coverHeight.value
);

const naturalToDisplayRatio = computed(
  () =>
    coverWidth.value &&
    displayedWidthNoBackground.value &&
    coverWidth.value / displayedWidthNoBackground.value
);

const firstPanelPosition = (pageUrl: string) => {
  const { x, y, width, height } = indexation.value!.pages.find(
    ({ url }) => url === pageUrl
  )!.aiKumikoResultPanels[0];
  return {
    left: x * displayRatioCropped.value!,
    top: y * displayRatioCropped.value!,
    width: width * displayRatioCropped.value!,
    height: height * displayRatioCropped.value!,
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

nextTick(() => {
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
});

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
      display: flex;
      align-items: center;
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

  .ocr-match,
  .kumiko-match {
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
