<template>
  <div class="fixed-container" @click.self="closeBook()">
    <img
      :src="edgeUrl"
      @load="
        ({ target }) => {
          edgeWidth = target.naturalWidth;
          coverHeight = target.naturalHeight;
        }
      "
    />
    <img
      v-if="pages?.length"
      :src="cloudinaryBaseUrl + pages[0].url"
      @load="
        ({ target }) => {
          coverRatio = target.naturalHeight / target.naturalWidth;
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
                :src="`${imagePath}/coafoot.png`"
                :title="`Voir ${publicationNames[publicationCode]} ${issueNumber} sur Inducks`"
                alt="Inducks"
            /></a>
            <Issue
              :publicationcode="publicationCode"
              :publicationname="publicationNames[publicationCode]"
              :issuenumber="issueNumber"
            />
            <h6 v-if="releaseDate">{{ $t("Sortie :") }} {{ releaseDate }}</h6>
            <h3>{{ $t("Table des matières") }}</h3>
          </template>
          <b-tabs
            :value="
              pages.findIndex(
                (page) =>
                  page.storycode === pagesWithUrl[currentPage] &&
                  pagesWithUrl[currentPage].storycode
              )
            "
            pills
            card
            vertical
            @input="
              currentPage = pagesWithUrl.findIndex(
                (page) => page.storycode === pages[$event].storycode
              )
            "
          >
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
              :title-item-class="!!url ? 'has-image' : ''"
            >
              <template #title>
                <Story
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
          :class="{ page: true, single: isSinglePageWithUrl }"
        >
          <div
            v-if="index === 0"
            :class="{ edge: true, closed: opening || opened }"
            :style="{
              backgroundImage: `url(${edgeUrl})`,
              width: `${edgeWidth}px`,
            }"
          />
          <div :class="{ 'page-content': true, 'first-page': index === 0 }">
            <div
              :class="{ 'page-image': true, opened: opening || opened }"
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
<script>
import { PageFlip } from "page-flip";
import Story from "./Story";
import Issue from "./Issue";
import { BCard, BTab, BTabs, useToast } from "bootstrap-vue-3";
import { coa } from "../stores/coa";
import { computed, watch } from "vue";

let toast = useToast();

const EDGES_BASE_URL = "https://edges.ducksmanager.net/edges/";
const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;

const props = defineProps({
  publicationCode: {
    type: String,
    required: true,
  },
  issueNumber: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["close-book"]);

const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dl7hskxab/image/upload/f_auto/inducks-covers/",
  edgeWidth = ref(null),
  coverHeight = ref(null),
  coverRatio = ref(null),
  opening = ref(false),
  opened = ref(false),
  closing = ref(false),
  closed = ref(false),
  book = ref(null),
  currentPage = ref(0),
  currentState = ref(null),
  publicationNames = computed(() => coa().publicationNames),
  issueDetails = computed(() => coa().issueDetails),
  isSinglePageWithUrl = computed(() => pagesWithUrl.value.length === 1),
  edgeUrl = computed(
    () =>
      `${EDGES_BASE_URL}${props.publicationCode.replace("/", "/gen/")}.${
        props.issueNumber
      }.png`
  ),
  coverWidth = computed(
    () => coverRatio.value && coverHeight.value / coverRatio.value
  ),
  state = computed(() => book.value?.getState()),
  currentIssueDetails = computed(
    () => issueDetails.value?.[`${props.publicationCode} ${props.issueNumber}`]
  ),
  pages = computed(() => currentIssueDetails.value?.value.entries),
  pagesWithUrl = computed(() => pages.value?.filter(({ url }) => !!url)),
  releaseDate = computed(() => {
    if (!currentIssueDetails.value?.releaseDate) {
      return null;
    }
    const parsedDate =
      currentIssueDetails.value.releaseDate.match(RELEASE_DATE_REGEX);
    return parsedDate?.[0]?.split("-").reverse().join("/");
  }),
  isReadyToOpen = computed(
    () => coverWidth.value && edgeWidth.value && pages.value && true
  ),
  showTableOfContents = computed(() => currentPage.value > 0 || opened.value),
  inducksLink = computed(() => {
    const [country, magazine] = props.publicationCode.split("/");
    return `https://inducks.org/compmag.php?country=${country}&title1=${magazine}&entrycodeh3=${props.issueNumber}`;
  });

watch(
  () => coverWidth,
  (newValue) => {
    const availableWidthPerPage = document.body.clientWidth / 2 - 15;
    if (newValue > availableWidthPerPage) {
      edgeWidth.value /= newValue / availableWidthPerPage;
      coverHeight.value /= newValue / availableWidthPerPage;
    }
  }
);
watch(
  () => isReadyToOpen.value,
  (newValue) => {
    if (newValue) {
      console.log("Creating book");
      book.value = new PageFlip(document.getElementById("book"), {
        width: coverWidth.value,
        height: coverHeight.value,

        size: "fixed",

        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: false,
        mobileScrollSupport: false,
      });
      book.value.loadFromHTML(document.querySelectorAll(".page"));

      book.value
        .on("flip", ({ data }) => {
          currentPage.value = data;
        })
        .on("changeState", ({ data }) => {
          currentState.value = data;
        });

      setTimeout(() => {
        opening.value = true;
      }, 50);
    }
  },
  { immediate: true }
);

watch(
  () => currentPage.value,
  (newValue) => {
    book.value.flip(newValue);
  }
);

watch(
  () => props.publicationCode,
  async () => {
    await loadBookPages();
  },
  { immediate: true }
);

watch(
  () => props.issueNumber,
  async () => {
    await loadBookPages();
  }
);

watch(
  () => pagesWithUrl.value,
  (newValue) => {
    if (newValue && !newValue.length) {
      toast.show(
        $t.value(
          "DucksManager n'a pas pu trouver d'informations sur le contenu de ce livre. Essayez-en un autre !"
        ),
        {
          autoHideDelay: 5000,
          noCloseButton: true,
          solid: true,
          title: $t.value("Pas d'informations sur le contenu du livre"),
          toaster: "b-toaster-top-center",
          variant: "warning",
        }
      );
      emit("close-book");
    }
  },
  { immediate: true }
);

const loadBookPages = async () => {
  await coa().fetchIssueUrls.value({
    publicationCode: props.publicationCode,
    issueNumber: props.issueNumber,
  });
};

const onEndOpenCloseTransition = () => {
  console.log("onEndOpenCloseTransition");
  if (opening.value) {
    opening.value = false;
    opened.value = true;
  }
  if (closing.value) {
    closing.value = false;
    closed.value = true;
    emit("close-book");
  }
};

const closeBook = () => {
  if (currentPage.value === 0) {
    opened.value = false;
    closing.value = true;
  } else {
    book.value.on("flip", () => {
      opened.value = false;
      closing.value = true;
    });
    book.value.flip(0);
  }
};
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

    :deep(:not(.has-image)) {
      a {
        cursor: default;
      }
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
