<template>
  <div
    v-if="l10n"
    class="fixed-container"
  >
    <img
      :src="edgeUrl"
      @load="({target}) => {edgeWidth = target.naturalWidth; coverHeight = target.naturalHeight}"
    >
    <img
      v-if="pages && pages.length"
      :src="cloudinaryBaseUrl + pages[0].url"
      @load="({target}) => { coverWidth = coverHeight / (target.naturalHeight/target.naturalWidth) }"
    >

    <div
      class="container"
      @click.self="closeBook()"
    >
      <div
        id="book"
        class="flip-book"
      >
        <b-card
          v-if="showTableOfContents"
          no-body
          class="table-of-contents"
        >
          <h3>{{ l10n.TABLE_DES_MATIERES }}</h3>
          <b-tabs
            v-model="currentPage"
            pills
            card
            vertical
            nav-wrapper-class="w-100"
          >
            >
            <b-tab
              v-for="{position} in pages"
              :key="`slide-${position}`"
              :title="`Page ${position}`"
            />
          </b-tabs>
        </b-card>
        <div
          v-for="({position, url}, index) in pages"
          :key="`page-${position}`"
          class="page"
        >
          <div
            v-if="index === 0"
            class="edge"
            :style="{
              backgroundImage: `url(${edgeUrl})`,
              width: `${edgeWidth}px`,
              transform: `rotate3d(0, 1, 0, ${rotation}deg)`}"
          />
          <div :class="{'page-content': true, 'first-page': index === 0}">
            <div
              class="page-image"
              :style="{
                backgroundImage: `url(${cloudinaryBaseUrl + url})`,
                marginLeft: index === 0 && rotation > -90 ? `${edgeWidth}px` : '0',
                transform : index === 0 ? `rotate3d(0, 1, 0, ${rotation + 90}deg)` : 'none',
                transformOrigin: 'left'
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {PageFlip} from 'page-flip';
import {mapActions, mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";

const EDGES_BASE_URL = 'https://edges.ducksmanager.net/edges/';

export default {
  name: "Book",

  mixins: [l10nMixin],

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
    cloudinaryBaseUrl: 'https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/',

    edgeWidth: null,
    coverWidth: null,
    coverHeight: null,

    rotationInterval: null,
    rotation: 0,
    book: null,
    currentPage: 0,
    currentState: null,
  }),

  computed: {
    ...mapState("coa", ["issueUrls"]),

    edgeUrl() {
      return `${EDGES_BASE_URL}${this.publicationCode.replace('/', '/gen/')}.${this.issueNumber}.png`
    },

    orientation() {
      return this.book && this.book.getOrientation()
    },
    state() {
      return this.book && this.book.getState()
    },

    pages() {
      return this.issueUrls && this.issueUrls[`${this.publicationCode} ${this.issueNumber}`]
    },

    isReadyToOpen() {
      return this.coverWidth && this.edgeWidth && this.pages && true
    },

    showTableOfContents() {
      return this.currentPage > 0 || this.rotation === -90
    }
  },

  watch: {
    isReadyToOpen: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const vm = this

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

          this.rotationInterval = setInterval(this.transformEdgeIntoCover, 5)
        }
      }
    },

    currentPage(newValue) {
      this.book.flip(newValue)
    },

    publicationCode: {
      immediate: true,
      async handler() {
        await this.loadBookPages()
      }
    },

    issueNumber: {
      immediate: true,
      async handler() {
        await this.loadBookPages()
      }
    }
  },

  methods: {
    ...mapActions("coa", ["fetchIssueUrls"]),

    async loadBookPages() {
      await this.fetchIssueUrls({
        publicationCode: this.publicationCode,
        issueNumber: this.issueNumber
      });
    },

    transformEdgeIntoCover() {
      if (this.rotation > -90) {
        this.rotation--
      } else {
        clearInterval(this.rotationInterval)
      }
    },

    transformCoverIntoEdge() {
      if (this.rotation < 0) {
        this.rotation++
      } else {
        clearInterval(this.rotationInterval)
        this.$emit('close-book')
      }
    },

    closeBook() {
      this.book.flip(0)
      this.rotationInterval = setInterval(this.transformCoverIntoEdge, 5)
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
  left: 325px;
  width: calc(100% - 325px);
  height: 100%;
  z-index: 2000;

  img {
    display: none
  }

  .table-of-contents {
    position: absolute;
    transform: translateX(100%);
    top: 0;
    right: 0;
    width: 210px;
    height: 100%;
    overflow-y: auto;
    color: black;
    white-space: nowrap;

    h3 {
      margin: 6px;
      text-align: center;
    }

    .col-auto {
      width: 100%;
    }

    ::v-deep .tab-content {
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
    transform-origin: right;
    height: 100%;
    z-index: 0;
  }

  .page {
    //background-color: hsl(35, 55, 98);
    color: hsl(35, 35, 35);
    //border: solid 1px hsl(35, 20, 70);

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
      background-color: hsl(35, 50, 90);
      //border: solid 1px hsl(35, 20, 50);
    }

    &.page-cover {
      background-color: hsl(35, 45, 80);
      color: hsl(35, 35, 35);
      //border: solid 1px hsl(35, 20, 50);

      h2 {
        text-align: center;
        padding-top: 50%;
        font-size: 210%;
      }

      &.page-cover-top {
        //box-shadow: inset 0 0 30px 0 rgba(36, 10, 3, 0.5), -2px 0 5px 2px rgba(0, 0, 0, 0.4);
      }

      &.page-cover-bottom {
        //box-shadow: inset 0 0 30px 0 rgba(36, 10, 3, 0.5), 10px 0 8px 0 rgba(0, 0, 0, 0.4);
      }
    }
  }
}
</style>