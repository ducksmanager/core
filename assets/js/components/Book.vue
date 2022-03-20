<template>
  <div
    class="fixed-container"
    @click.self="closeBook()"
  >
    <img
      :src="edgeUrl"
      @load="({target}) => {edgeWidth = target.naturalWidth; coverHeight = target.naturalHeight}"
    >
    <img
      v-if="pages && pages.length"
      :src="cloudinaryBaseUrl + pages[0].url"
      @load="({target}) => { coverRatio = target.naturalHeight/target.naturalWidth }"
    >

    <div
      class="container"
      @click.self="closeBook()"
    >
      <div
        id="book"
        class="flip-book"
        @click.self="closeBook()"
      >
        <b-card
          v-if="showTableOfContents"
          no-body
          class="table-of-contents d-none d-md-block"
        >
          <template #header>
            <a
              :href="inducksLink"
              target="_blank"
              class="inducks-link"
            ><img
              :src="`${imagePath}/coafoot.png`"
              :title="`Voir ${publicationNames[publicationCode]} ${issueNumber} sur Inducks`"
              alt="Inducks"
            ></a>
            <Issue
              :publicationcode="publicationCode"
              :publicationname="publicationNames[publicationCode]"
              :issuenumber="issueNumber"
            />
            <h6 v-if="releaseDate">
              {{ $t('Sortie :') }} {{ releaseDate }}
            </h6>
            <h3>{{ $t('Table des matières') }}</h3>
          </template>
          <b-tabs
            :value="pages.findIndex(page => page.storycode === pagesWithUrl[currentPage] && pagesWithUrl[currentPage].storycode)"
            pills
            card
            vertical
            @input="currentPage = pagesWithUrl.findIndex(page => page.storycode === pages[$event].storycode)"
          >
            <b-tab
              v-for="{storycode, kind, entirepages, url, title, position, part} in pages"
              :key="`slide-${position}`"
              :title-item-class="!!url ? 'has-image':''"
            >
              <template #title>
                <Story
                  no-link
                  :kind="`${kind}${kind === 'n' && entirepages < 1 ? '_g' : ''}`"
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
          v-for="({position, url }, index) in pagesWithUrl"
          :key="`page-${position}`"
          :class="{page: true, single: isSinglePageWithUrl}"
        >
          <div
            v-if="index === 0"
            :class="{edge: true, closed: opening || opened }"
            :style="{
              backgroundImage: `url(${edgeUrl})`,
              width: `${edgeWidth}px`
            }"
          />
          <div :class="{'page-content': true, 'first-page': index === 0}">
            <div
              :class="{'page-image': true, opened: opening || opened}"
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
import {PageFlip} from 'page-flip';
import { mapActions, mapState } from "pinia";
import l10nMixin from "../mixins/l10nMixin";
import Story from "./Story";
import Issue from "./Issue";
import {BCard, BTab, BTabs} from "bootstrap-vue";
import { coa } from "../stores/coa";
import bookMixin from "../mixins/bookMixin";

const EDGES_BASE_URL = 'https://edges.ducksmanager.net/edges/';
const RELEASE_DATE_REGEX = /^\d+(?:-\d+)?(?:-Q?\d+)?$/;

export default {
  name: "Book",
  components: {Issue, Story, BCard, BTabs, BTab},
  mixins: [l10nMixin, bookMixin],

  props: {
    publicationCode: {
      type: String,
      required: true
    },
    issueNumber: {
      type: String,
      required: true
    }
  },
  emits: ['close-book'],

  data: () => ({
    opening: false,
    opened: false,
    closing: false,
    closed: false,

    book: null,
    currentPage: 0,
    currentState: null,
  }),

  computed: {
    ...mapState(coa, ["publicationNames", "issueDetails"]),

    isSinglePageWithUrl() {
      return this.pagesWithUrl.length === 1;
    },

    edgeUrl() {
      return `${EDGES_BASE_URL}${this.publicationCode.replace('/', '/gen/')}.${this.issueNumber}.png`
    },

    orientation() {
      return this.book && this.book.getOrientation()
    },

    state() {
      return this.book && this.book.getState()
    },

    currentIssueDetails() {
      return this.getIssueDetails(this.publicationCode, this.issueNumber)
    },

    pages() {
      return this.currentIssueDetails && this.currentIssueDetails.entries
    },

    pagesWithUrl() {
      return this.pages && this.pages.filter(({url}) => !!url)
    },

    releaseDate() {
      if (!(this.currentIssueDetails && this.currentIssueDetails.releaseDate)) {
        return null;
      }
      const parsedDate = this.currentIssueDetails.releaseDate.match(RELEASE_DATE_REGEX)
      return parsedDate && parsedDate[0] && parsedDate[0].split('-').reverse().join('/')
    },

    isReadyToOpen() {
      return this.coverWidth && this.edgeWidth && this.pages && true
    },

    showTableOfContents() {
      return this.currentPage > 0 || this.opened
    },

    inducksLink() {
      const [ country, magazine ] = this.publicationCode.split('/')
      return `https://inducks.org/compmag.php?country=${country}&title1=${magazine}&entrycodeh3=${this.issueNumber}`
    }
  },

  watch: {
    isReadyToOpen: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const vm = this

          console.log('Creating book')
          this.book = new PageFlip(
            document.getElementById("book"),
            {
              width: this.coverWidth,
              height: this.coverHeight,

              size: "fixed",

              maxShadowOpacity: 0.5,
              showCover: true,
              usePortrait: false,
              mobileScrollSupport: false
            }
          );
          this.book.loadFromHTML(document.querySelectorAll(".page"));

          this.book
            .on("flip", ({data}) => {
              vm.currentPage = data
            })
            .on("changeState", ({data}) => {
              vm.currentState = data
            })

          setTimeout(() => {
            vm.opening = true
          }, 50)
        }
      }
    },

    currentPage(newValue) {
      this.book.flip(newValue)
    },

    publicationCode: {
      immediate: true,
      async handler() {
        await this.loadBookPages(this.publicationCode, this.issueNumber)
      }
    },

    async issueNumber() {
      await this.loadBookPages(this.publicationCode, this.issueNumber)
    },

    pagesWithUrl: {
      immediate: true,
      handler(newValue) {
        if (newValue && !newValue.length) {
          this.$root.$bvToast.toast(this.$t("DucksManager n'a pas pu trouver d'informations sur le contenu de ce livre. Essayez-en un autre !"), {
            autoHideDelay: 5000,
            noCloseButton: true,
            solid: true,
            title: this.$t("Pas d'informations sur le contenu du livre"),
            toaster: 'b-toaster-top-center',
            variant: 'warning'
          })
          this.$emit('close-book')
        }
      }
    }
  },

  methods: {
    ...mapActions(coa, ['getIssueDetails']),

    onEndOpenCloseTransition() {
      console.log('onEndOpenCloseTransition')
      if (this.opening) {
        this.opening = false
        this.opened = true
      }
      if (this.closing) {
        this.closing = false
        this.closed = true
        this.$emit('close-book')
      }
    },

    closeBook() {
      const vm = this
      if (this.currentPage === 0) {
        vm.opened = false
        vm.closing = true
      } else {
        this.book.on('flip', () => {
          vm.opened = false
          vm.closing = true
        })
        this.book.flip(0)
      }
    }
  },
}
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
    display: none
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

      ::v-deep a, ::v-deep h6 {
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

    ::v-deep ul {
      overflow-x: auto;
    }

    ::v-deep .tab-content {
      display: none;
    }

    ::v-deep :not(.has-image) {
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
      transform: rotate3d(0, 1, 0, -45deg) !important;
    }
  }

  .page {
    color: #785E3A;

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

    &.--left { // for left page (property will be added automatically)
      border-right: 0;

      .page-image {
        box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
      }
    }

    &.--right { // for right page (property will be added automatically)
      border-left: 0;

      .page-image {
        box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);
      }
    }

    &.hard { // for hard page
      background-color: #F2E8D9;
    }

    &.page-cover {
      background-color: #E3D0B5;
      color: #785E3A;
    }

    &.single {
      left: initial !important;
      right: 0 !important;
    }
  }
}
</style>
