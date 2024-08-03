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
                    :class="`position-absolute start-${
                      idx * 100
                    } ai-results-page-${shownPage.pageNumber}`"
                    :style="{
                      width: `${displayedWidthNoBackground!}px`,
                      height: `${displayedHeightNoBackground!}px`,
                    }"
                  >
                    <div
                      v-for="panel in shownPage.aiKumikoResultPanels"
                      :key="`kumiko-match-${panel.id}`"
                      class="position-absolute kumiko-match panel"
                      :style="
                        (['left', 'top', 'width', 'height'] as const).reduce(
                          (acc, key) => ({
                            ...acc,
                            [key]: `${
                              (panel[
                                key === 'left' ? 'x' : key === 'top' ? 'x' : key
                              ] *
                                displayRatioCropped!) /
                              naturalToDisplayRatio!
                            }px`,
                          }),
                          {}
                        )
                      "
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
                          clipPath: `polygon(${[
                            [x1, y1],
                            [x2, y2],
                            [x3, y3],
                            [x4, y4],
                          ]
                            .map(([x, y]) =>
                              (['width', 'height'] as const)
                                .map(
                                  (dimension) =>
                                    `${
                                      [x, y][idx] /
                                      (shownPage.aiKumikoResultPanels[0][
                                        dimension
                                      ] /
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
      <table-of-contents
        v-model="currentPage"
        :indexation="indexation"
        :shown-pages="shownPages"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";

import { suggestions } from "~/stores/suggestions";

let book = ref<PageFlip | null>(null);
const coverWidth = ref<number | null>(null);
const coverHeight = ref<number | null>(null);
const currentPage = ref(0);

defineProps<{ indexationId: string }>();

const { indexation } = storeToRefs(suggestions());

const isSinglePage = computed(() => indexation.value?.pages.length === 1);
const displayedWidth = computed(() => book.value?.getSettings().width);
const displayedHeight = computed(() => book.value?.getSettings().height);

const naturalAspectRatio = computed(
  () =>
    coverWidth.value &&
    coverHeight.value &&
    coverWidth.value / coverHeight.value,
);

const displayedHeightNoBackground = computed(() =>
  naturalAspectRatio.value
    ? naturalAspectRatio.value < 1
      ? displayedHeight.value
      : displayedHeight.value! / naturalAspectRatio.value
    : null,
);

const displayedWidthNoBackground = computed(() =>
  naturalAspectRatio.value
    ? naturalAspectRatio.value > 1
      ? displayedWidth.value
      : displayedWidth.value! * naturalAspectRatio.value
    : null,
);

const shownPages = computed(() =>
  book.value
    ? [
        ...new Set([
          book.value.getCurrentPageIndex(),
          (book.value as unknown as { pages: { currentSpreadIndex: number } })!
            .pages.currentSpreadIndex * 2,
        ]),
      ]
    : [],
);

const displayRatioCropped = computed(
  () =>
    displayedHeight.value &&
    coverHeight.value &&
    displayedHeight.value / coverHeight.value,
);

const naturalToDisplayRatio = computed(
  () =>
    coverWidth.value &&
    displayedWidthNoBackground.value &&
    coverWidth.value / displayedWidthNoBackground.value,
);

const firstPanelPosition = (pageUrl: string) => {
  const { x, y, width, height } = indexation.value!.pages.find(
    ({ url }) => url === pageUrl,
  )!.aiKumikoResultPanels?.[0] || { x: 0, y: 0, width: 0, height: 0 };
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
    {},
  );

watch(currentPage, (newValue) => {
  if (book.value) {
    book.value.flip(newValue);
  }
});

watch(coverWidth, (newValue) => {
  const availableWidthPerPage = document.body.clientWidth / 2 - 15;
  if (newValue && newValue > availableWidthPerPage) {
    coverHeight.value! /= newValue / availableWidthPerPage;
  }
});

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
          },
        );
        book.value.loadFromHTML(document.querySelectorAll(".page"));

        book.value.on("flip", ({ data }) => {
          currentPage.value = parseInt(data.toString());
        });
      }
    },
    { immediate: true },
  );
});
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
</style>
