<template>
  <img
    class="d-none"
    v-if="entries?.length"
    :src="entries[0].url.url"
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
    <div class="container w-50 h-100 m-0">
      <div id="book" class="flip-book">
        <div
          v-for="({ position, url }, index) in entries"
          :key="`page-${position}`"
          class="page"
          :class="{ single: isSinglePage }"
        >
          <div class="page-content" :class="{ 'first-page': index === 0 }">
            <div
              class="page-image"
              :style="{
                backgroundImage: `url(${url.url})`,
                marginLeft: 0,
              }"
            />
          </div>
        </div>
      </div>
    </div>
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
            @click="loadHint"
            :class="{ loading: isHintLoading, loaded: isHintLoaded }"
          >
            <i-bi-lightbulb-fill
          /></b-button>
        </div>
        <Issue
          v-if="issue.publicationcode && issue.issuenumber"
          :publicationcode="issue.publicationcode"
          :publicationname="
            publicationNames[issue.publicationcode] || issue.publicationcode
          "
          :issuenumber="issue.issuenumber"
        />
        <template v-else>Numéro inconnu</template>
        <h6 v-if="releaseDate">{{ "Sortie :" }} {{ releaseDate }}</h6>
        <h3>{{ "Table des matières" }}</h3>
      </template>
      <b-tabs v-if="entries" v-model="currentTabIndex" pills card vertical>
        <b-tab
          :entry="entry"
          v-for="(entry, index) in entries"
          :key="`slide-${entry.position}`"
          ><template #title
            ><InducksEntry
              :editable="currentTabIndex === index"
              :entry-index="index" /></template
        ></b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { PageFlip } from "page-flip";
import { computed, ref, watch } from "vue";
import { coa } from "~/stores/coa";
import { StoryversionKind, issueDetails } from "~/stores/issueDetails";
import { defaultApi } from "~/util/api";
import useHintMaker from "~/composables/useHintMaker";

const route = useRoute();

const hintMaker = useHintMaker();

const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;
const coverWidth = ref(null as number | null);
let coverHeight = ref(null as number | null);
let book = ref(null as PageFlip | null);
let currentEntry = ref(0 as number);
const currentTabIndex = ref(0 as number);
const publicationNames = computed(() => coa().publicationNames);
const isSinglePage = computed(() => entries.value.length === 1);
const issue = computed(() => issueDetails().issue);
const entries = computed(() => issueDetails().entries);
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

  if (entries.value[0].storyversion?.kind === StoryversionKind.Cover) {
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
    currentEntry.value = entries.value.findIndex(
      ({ url }) => url.url === entries.value[newValue].url.url
    );
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
  () => currentEntry.value,
  (newValue) => {
    if (book.value) {
      book.value.flip(newValue);
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
        currentEntry.value = parseInt(data.toString());
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

.inducks-link {
  position: absolute;
  cursor: pointer !important;
  top: 6px;
  right: 6px;
  border: 0;
  width: 24px;

  img {
    display: initial;
    width: 100%;
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
