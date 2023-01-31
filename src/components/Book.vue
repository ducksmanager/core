<template>
  <div class="fixed-container" @click.self="closeBook()">
    <img
      :src="edgeUrl"
      @load="
        ({ target }) => {
          edgeWidth = (target as HTMLImageElement).naturalWidth;
          coverHeight = (target as HTMLImageElement).naturalHeight;
        }
      "
    />
    <img
      v-if="pages?.length"
      :src="cloudinaryBaseUrl + pages[0].url"
      @load="
        ({ target }) => {
          coverRatio = (target as HTMLImageElement).naturalHeight / (target as HTMLImageElement).naturalWidth;
        }
      "
    />

    <div class="container" @click.self="closeBook()">
      <div id="book" class="flip-book" @click.self="closeBook()">
        <b-card
          v-if="showTableOfContents"
          no-body
          class="table-of-contents d-none d-md-block"
        >
          <template #header>
            <a :href="inducksLink" target="_blank" class="inducks-link"
              ><img
                :src="getImagePath('coafoot.png')"
                :title="`Voir ${publicationNames[publicationcode]} ${issuenumber} sur Inducks`"
                alt="Inducks"
            /></a>
            <Issue
              :publicationcode="publicationcode"
              :publicationname="publicationNames[publicationcode]"
              :issuenumber="issuenumber"
            />
            <h6 v-if="releaseDate">{{ $t("Sortie :") }} {{ releaseDate }}</h6>
            <h3>{{ $t("Table des matières") }}</h3>
          </template>
          <b-tabs v-if="pages" v-model="currentTabIndex" pills card vertical>
            <b-tab
              v-for="{
                storycode,
                kind,
                entirepages,
                url,
                title,
                position,
                part,
              } in pages"
              :key="`slide-${position}`"
              :disabled="!url"
            >
              <template #title>
                <InducksStory
                  no-link
                  :kind="`${kind}${
                    kind === 'n' && entirepages < 1 ? '_g' : ''
                  }`"
                  :title="title"
                  :storycode="storycode"
                  :part="part"
                  :dark="!!url"
                />
              </template>
            </b-tab>
          </b-tabs>
        </b-card>
        <div
          v-for="({ position, url }, index) in pagesWithUrl"
          :key="`page-${position}`"
          class="page"
          :class="{ single: isSinglePageWithUrl }"
        >
          <div
            v-if="index === 0"
            class="edge"
            :class="{ closed: opening || opened }"
            :style="{
              backgroundImage: `url(${edgeUrl})`,
              width: `${edgeWidth}px`,
            }"
          />
          <div class="page-content" :class="{ 'first-page': index === 0 }">
            <div
              class="page-image"
              :class="{ opened: opening || opened }"
              :style="{
                backgroundImage: `url(${cloudinaryBaseUrl + url})`,
                marginLeft: opening || opened ? '0' : `${edgeWidth}px`,
              }"
              @transitionend="onEndOpenCloseTransition()"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BCard, BTab, BTabs, useToast } from "bootstrap-vue-next";
import { PageFlip } from "page-flip";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { images } from "~/stores/images";

const { issuenumber, publicationcode } = defineProps<{
  publicationcode: string;
  issuenumber: string;
}>();
const emit = defineEmits<{ (e: "close-book"): void }>();

const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;
const cloudinaryBaseUrl =
  "https://res.cloudinary.com/dl7hskxab/image/upload/f_auto/inducks-covers/";
const getImagePath = images().getImagePath;

const toast = useToast();
let edgeWidth = $ref(null as number | null);
let coverHeight = $ref(null as number | null);
const coverRatio = $ref(null as number | null);
let opening = $ref(false as boolean);
let opened = $ref(false as boolean);
let closing = $ref(false as boolean);
let book = $ref(null as PageFlip | null);
let currentPage = $ref(0 as number);
const currentTabIndex = $ref(0 as number);
const publicationNames = $computed(() => coa().publicationNames);
const issueDetails = $computed(() => coa().issueDetails);
const isSinglePageWithUrl = $computed(() => pagesWithUrl.length === 1);
const edgeUrl = $computed(
  () =>
    `${import.meta.env.EDGES_BASE_URL}${publicationcode.replace(
      "/",
      "/gen/"
    )}.${issuenumber}.png`
);
const coverWidth = $computed(
  () => coverRatio && (coverHeight || 0) / coverRatio
);
const currentIssueDetails = $computed(
  () => issueDetails?.[`${publicationcode} ${issuenumber}`]
);
const pages = $computed(() => currentIssueDetails?.entries);
let pagesWithUrl = $computed(() => pages?.filter(({ url }) => !!url));
const releaseDate = $computed(() => {
  if (!currentIssueDetails?.releaseDate) return null;

  const parsedDate = currentIssueDetails.releaseDate.match(RELEASE_DATE_REGEX);
  return parsedDate?.[0]?.split("-").reverse().join("/");
});
const isReadyToOpen = $computed(() => coverWidth && edgeWidth && pages && true);
const showTableOfContents = $computed(() => currentPage > 0 || opened);
const inducksLink = $computed(() => {
  const [country, magazine] = publicationcode.split("/");
  return `https://inducks.org/compmag.php?country=${country}&title1=${magazine}&entrycodeh3=${issuenumber}`;
});
const { t: $t } = useI18n();

const loadBookPages = async () => {
  await coa().fetchIssueUrls({
    publicationcode,
    issuenumber,
  });
};

const onEndOpenCloseTransition = () => {
  if (opening) {
    opening = false;
    opened = true;
  }
  if (closing) {
    closing = false;
    emit("close-book");
  }
};

const closeBook = () => {
  if (currentPage === 0) {
    opened = false;
    closing = true;
  } else if (book) {
    book.on("flip", () => {
      opened = false;
      closing = true;
    });
    book.flip(0);
  }
};

watch(
  () => currentTabIndex,
  (newValue) => {
    currentPage = pagesWithUrl.findIndex(
      (page) => page.storycode === pages[newValue].storycode
    );
  }
);

watch(
  () => coverWidth,
  (newValue) => {
    const availableWidthPerPage = document.body.clientWidth / 2 - 15;
    if (newValue && newValue > availableWidthPerPage) {
      edgeWidth! /= newValue / availableWidthPerPage;
      coverHeight! /= newValue / availableWidthPerPage;
    }
  }
);
watch(
  () => isReadyToOpen,
  (newValue) => {
    if (newValue && coverWidth && coverHeight) {
      console.log("Creating book");
      book = new PageFlip(document.getElementById("book") as HTMLElement, {
        width: coverWidth,
        height: coverHeight,

        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: false,
        mobileScrollSupport: false,
      });
      book.loadFromHTML(document.querySelectorAll(".page"));

      book.on("flip", ({ data }) => {
        currentPage = parseInt(data.toString());
      });

      setTimeout(() => {
        opening = true;
      }, 50);
    }
  },
  { immediate: true }
);

watch(
  () => currentPage,
  (newValue) => {
    if (book) {
      book.flip(newValue);
    }
  }
);

watch(
  () => publicationcode,
  async () => {
    await loadBookPages();
  },
  { immediate: true }
);

watch(
  () => issuenumber,
  async () => {
    await loadBookPages();
  }
);

watch(
  () => pagesWithUrl,
  (newValue) => {
    if (newValue && !newValue.length) {
      toast!.show(
        {
          body: $t(
            "DucksManager n'a pas pu trouver d'informations sur le contenu de ce livre. Essayez-en un autre !"
          ),
          title: $t("Pas d'informations sur le contenu du livre"),
        },
        {
          autoHide: true,
          delay: 5000,
          noCloseButton: true,
          pos: "top-center",
          variant: "warning",
        }
      );
      emit("close-book");
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.fixed-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;

  img {
    display: none;
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
    position: absolute;
    transform: translateX(100%);
    top: 0;
    right: 0;
    width: auto;
    max-width: 400px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #eee;
    color: black;
    white-space: nowrap;

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
    display: none;
    margin: auto;
    background-size: cover;
  }

  .edge {
    position: absolute;
    background-size: cover;
    background-repeat: no-repeat;
    transform: rotate3d(0, 1, 0, 0deg);
    transform-origin: right;
    transition: all 1s linear;
    height: 100%;
    z-index: 0;

    &.closed {
      transform: rotate3d(0, 1, 0, -90deg) !important;
    }
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

          &.opened {
            transform: rotate3d(0, 1, 0, 0deg);
          }
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
}
</style>
