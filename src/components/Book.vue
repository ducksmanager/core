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
    <b-container class="d-flex w-50 h-100 m-0">
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
            />
          </div>
        </div>
      </div>
    </b-container>
    <b-card
      no-body
      class="table-of-contents d-none d-md-block w-50 h-100 m-0 overflow-auto"
    >
      <template #header>
        <div>
          <b-button
            variant="success"
            pill
            class="ms-2 hint"
            :disabled="isHintLoading"
            :class="{ loading: isHintLoading, loaded: isHintLoaded }"
            @click="loadHint"
          >
            <i-bi-lightbulb-fill
          /></b-button>
        </div>
        <IssueSuggestionModal />
        <IssueSuggestionList />
        <h6 v-if="releaseDate">{{ "Sortie :" }} {{ releaseDate }}</h6>
        <h3>{{ "Table des matières" }}</h3>
      </template>
      <b-tabs v-if="entries" v-model="currentTabIndex" pills card vertical>
        <b-tab
          v-for="(entryurl, index) in Object.keys(entries)"
          :key="entryurl"
          title-link-class="w-100 d-flex align-items-left"
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

import useHintMaker from "~/composables/useHintMaker";
import { issueDetails, StoryversionKind } from "~/stores/issueDetails";
import { defaultApi } from "~/util/api";

const route = useRoute();

const hintMaker = useHintMaker();

const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;
const coverWidth = ref(null as number | null);
let coverHeight = ref(null as number | null);
let book = ref(null as PageFlip | null);
const currentTabIndex = ref(0 as number);

const { acceptedEntries } = storeToRefs(issueDetails());
const isSinglePage = computed(() => Object.keys(entries.value).length === 1);
const entries = computed(() => issueDetails().entrySuggestions);
const releaseDate = computed(() => {
  if (!issueDetails().issue?.oldestdate) return null;

  const parsedDate =
    issueDetails().issue?.oldestdate!.match(RELEASE_DATE_REGEX);
  return parsedDate?.[0]?.split("-").reverse().join("/");
});

const isHintLoading = ref(false);
const isHintLoaded = ref(false);

const loadHint = async () => {
  isHintLoading.value = true;
  console.log("Kumiko...");
  const { data } = await defaultApi
    .get(
      `${import.meta.env.VITE_BACKEND_URL}/cloudinary/indexation/${
        route.params.id
      }/ai/kumiko`
    )
    .catch((e) => {
      console.error(e);
      return { data: { results: [] } };
    })
    .finally(() => {
      console.log("Kumiko terminé");
    });

  console.log("Kumiko OK");
  hintMaker.applyHintsFromKumiko(data);

  if (
    acceptedEntries.value[Object.keys(entries.value)[0]].storyversion?.kind ===
    StoryversionKind.Cover
  ) {
    console.info(
      "La première page est une couverture, on va chercher si on la détecte parmi les résultats de la recherche par image..."
    );
    const { data } = await defaultApi
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/cloudinary/indexation/${
          route.params.id
        }/ai/cover-search`
      )
      .catch((e) => {
        console.error(e);
        return { data: { results: [] } };
      })
      .finally(() => {
        console.log("Recherche par image terminée");
        isHintLoading.value = false;
      });
    hintMaker.applyHintsFromCoverSearch(data);
  }
  isHintLoaded.value = true;
};

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
      book.value = new PageFlip(
        document.getElementById("book") as HTMLElement,
        {
          width: coverWidth.value!,
          height: coverHeight.value!,

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
</script>

<style scoped lang="scss">
#book-and-toc-container {
  height: 100%;
}

@keyframes pulse-primary {
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
        animation: pulse-primary 2s infinite;
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
        background-size: cover;
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
}
</style>
