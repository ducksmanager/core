<template>
  <img
    v-if="Object.keys(entries).length"
    class="d-none"
    :src="Object.keys(entries)[0]"
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
          v-for="(url, index) in Object.keys(entries)"
          :key="`page-${index}`"
          class="page"
          :class="{ single: isSinglePage }"
        >
          <div class="page-content" :class="{ 'first-page': index === 0 }">
            <div
              class="page-image"
              :style="{
                backgroundImage: `url(${url})`,
                marginLeft: 0,
              }"
            >
              <template
                v-if="
                  showAiDetections !== undefined &&
                  xOffset !== undefined &&
                  displayRatio
                "
              >
                <div
                  v-for="({ bbox: { x, y, width, height } }, idx) in aiDetails[
                    url
                  ][/*showAiDetails === 'entry' ? 'texts' :*/ 'panels'] || []"
                  :key="`ocr-match-${idx}`"
                  class="position-absolute ocr-match"
                  :style="{
                    left: `${(xOffset || 0) + x * displayRatio}px`,
                    top: `${y * displayRatio}px`,
                    width: `${width * displayRatio}px`,
                    height: `${height * displayRatio}px`,
                  }"
                ></div>
              </template>
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
        <div>
          <b-button
            variant="success"
            pill
            class="ms-2 hint"
            :disabled="ai.status.value === 'loading'"
            :class="ai.status.value"
            @click="ai.runKumiko(indexationId)"
          >
            <i-bi-lightbulb-fill
          /></b-button>
        </div>
        <IssueSuggestionModal />
        <IssueSuggestionList />
        <h6 v-if="releaseDate">{{ "Sortie :" }} {{ releaseDate }}</h6>
        <h3>{{ "Table des matières" }}</h3></template
      >

      <b-tabs
        v-if="entries"
        v-model="currentTabIndex"
        pills
        card
        vertical
        class="flex-grow-1"
        nav-wrapper-class="w-100 h-100 flex-grow-1"
        nav-class="w-100 h-100"
      >
        <b-tab
          v-for="(entryurl, index) in Object.keys(entries)"
          :key="entryurl"
          title-link-class="w-100 h-100 d-flex align-items-left"
          title-item-class="w-100"
          ><template #title
            ><Entry
              :entryurl="entryurl"
              :editable="currentTabIndex === index" /></template
        ></b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

import useAi from "~/composables/useAi";
import { ai as aiStore } from "~/stores/ai";
import { suggestions } from "~/stores/suggestions";
import { user } from "~/stores/user";

const route = useRoute();
const ai = useAi();
const aiDetails = storeToRefs(aiStore()).aiDetails;

const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;
const coverWidth = ref(null as number | null);
let coverHeight = ref(null as number | null);
let book = ref(null as PageFlip | null);
const currentTabIndex = ref(0 as number);

const { storyversionKindSuggestions } = storeToRefs(suggestions());

const showAiDetections = computed(() => user().showAiDetectionsOn);

const indexationId = computed(() => route.params.id as string);
const isSinglePage = computed(() => Object.keys(entries.value).length === 1);
const entries = computed(() => suggestions().entrySuggestions);
const releaseDate = computed(() => {
  if (!suggestions().acceptedIssue?.data.oldestdate) return null;

  const parsedDate =
    suggestions().acceptedIssue?.data.oldestdate!.match(RELEASE_DATE_REGEX);
  return parsedDate?.[0]?.split("-").reverse().join("/");
});

const xOffset = computed(
  () =>
    book.value?.getSettings().width &&
    displayRatio.value &&
    coverWidth.value &&
    (book.value?.getSettings().width - coverWidth.value * displayRatio.value) /
      2
);

const displayRatio = computed(
  () =>
    book.value?.getSettings().height &&
    coverHeight.value &&
    book.value?.getSettings().height / coverHeight.value
);

watch(
  () => currentTabIndex.value,
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
        currentTabIndex.value = parseInt(data.toString());
      });
    }
  },
  { immediate: true }
);

watch(
  () => storyversionKindSuggestions.value,
  async () => {
    await ai.runCoverSearch(indexationId.value);
    await ai.runStorycodeOcr(indexationId.value);
    ai.status.value = "loaded";
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
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
  }
}
</style>
