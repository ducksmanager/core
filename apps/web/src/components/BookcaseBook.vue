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
          coverRatio =
            (target as HTMLImageElement).naturalHeight /
            (target as HTMLImageElement).naturalWidth;
        }
      "
    />

    <Book
      v-model:book="book as PageFlip | undefined"
      v-model:opening="opening"
      v-model:opened="opened"
      v-model:closing="closing"
      v-model:current-page="currentPage"
      :cover-height="coverHeight"
      :cover-ratio="coverRatio"
      :urls="
        pagesWithUrl.map((page) => ({
          ...page,
          url: cloudinaryBaseUrl + page.url,
        }))
      "
      @close-book="closeBook()"
    >
      <template #table-of-contents>
        <b-card no-body class="table-of-contents d-none d-md-block">
          <template #header>
            <a :href="inducksLink" target="_blank" class="inducks-link"
              ><img
                :src="getImagePath('coafoot.png')"
                :title="`Voir ${publicationNames[issue.publicationcode]} ${issue.issuenumber} sur Inducks`"
                alt="Inducks"
            /></a>
            <Issue :issuecode="issuecode" />
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
                  :show-link="false"
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
      </template>
      <template #edge>
        <div
          class="edge"
          :class="{ closed: opening || opened }"
          :style="{
            backgroundImage: `url(${edgeUrl})`,
            width: `${edgeWidth}px`,
          }"
        />
      </template>
    </Book>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "bootstrap-vue-next";
import type { PageFlip } from "page-flip";

const { issuecode } = defineProps<{
  issuecode: string;
}>();
const emit = defineEmits<{ (e: "close-book"): void }>();

const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;
const cloudinaryBaseUrl =
  "https://res.cloudinary.com/dl7hskxab/image/upload/f_auto/inducks-covers/";

const { fetchIssueUrls } = coa();
const { getImagePath } = images();

const toast = useToast();
const edgeWidth = ref<number | null>(null);
const coverHeight = ref<number | undefined>(undefined);
const coverRatio = ref<number | undefined>(undefined);
const opening = ref(false);
const opened = ref(false);
const closing = ref(false);
const book = ref<PageFlip | undefined>(undefined);
const currentPage = ref(0);
const currentTabIndex = ref(0);
const { publicationNames, issueDetails, issuecodeDetails } = storeToRefs(coa());

const coverWidth = computed(
  () => coverRatio.value && (coverHeight.value || 0) / coverRatio.value,
);

const edgeUrl = computed(
  () =>
    `${import.meta.env.VITE_EDGES_ROOT}${issue.value.publicationcode.replace(
      "/",
      "/gen/",
    )}.${issue.value.issuenumber}.png`,
);
const currentIssueEntryDetails = computed(
  () => issueDetails.value?.[issuecode],
);
const issue = computed(() => issuecodeDetails.value?.[issuecode]);
const pages = computed(() => currentIssueEntryDetails.value?.entries);
const pagesWithUrl = computed(() => pages.value?.filter(({ url }) => !!url));
const releaseDate = computed(() => {
  if (!issueDetails.value[issuecode]?.releaseDate) return null;

  const parsedDate =
    currentIssueEntryDetails.value.releaseDate?.match(RELEASE_DATE_REGEX);
  return parsedDate?.[0]?.split("-").reverse().join("/");
});
const inducksLink = computed(() => {
  const { publicationcode, issuenumber } = issuecodeDetails.value[issuecode];
  const [country, magazine] = publicationcode.split("/");
  return `https://inducks.org/compmag.php?country=${country}&title1=${magazine}&entrycodeh3=${issuenumber}`;
});
const { t: $t } = useI18n();

const loadBookPages = () =>
  fetchIssueUrls({
    issuecode,
  });

const closeBook = () => {
  if (currentPage.value === 0) {
    opened.value = false;
    closing.value = true;
  } else if (book.value) {
    book.value.on("flip", () => {
      opened.value = false;
      closing.value = true;
    });
    book.value.flip(0);
  }
};

watch(currentTabIndex, (newValue) => {
  currentPage.value = pagesWithUrl.value.findIndex(
    (page) => page.storycode === pages.value[newValue].storycode,
  );
});

watch(coverWidth, (newValue) => {
  const availableWidthPerPage = document.body.clientWidth / 2 - 15;
  if (newValue && newValue > availableWidthPerPage) {
    coverHeight.value! /= newValue / availableWidthPerPage;
  }
});

watch(issue, () => loadBookPages(), { immediate: true });

watch(
  pagesWithUrl,
  (newValue) => {
    if (newValue && !newValue.length) {
      toast.show!({
        props: {
          body: $t(
            "DucksManager n'a pas pu trouver d'informations sur le contenu de ce livre. Essayez-en un autre !",
          ),
          title: $t("Pas d'informations sur le contenu du livre"),
          noCloseButton: true,
          pos: "top-center",
          variant: "warning",
        },
      });
      emit("close-book");
    }
  },
  { immediate: true },
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
}
</style>
