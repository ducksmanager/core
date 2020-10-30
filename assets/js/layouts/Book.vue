<template>
  <div>
    <img
      :src="edgeUrl"
      style="display: none"
      @load="({target}) => {isEdgeLoaded = true; edgeWidth = target.naturalWidth}"
    >
    <img
      v-if="pages && pages.length"
      :src="cloudinaryBaseUrl + pages[0].url"
      style="display: none"
      @load="isCoverLoaded = true"
    >
    <b-carousel
      v-if="book"
      controls
      indicators
      :interval="0"
      @input="(newPage) => {book.flip(newPage)}"
    >
      <b-carousel-slide
        v-for="{position} in pages"
        :key="`slide-${position}`"
        :caption="currentState === 'flipping' ? 'Turning...' : `Page ${currentPage}`"
      >
        <template #img>
&nbsp;
        </template>
      </b-carousel-slide>
    </b-carousel>

    <div class="container">
      <div
        id="book"
        class="flip-book"
      >
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
          <div class="page-content">
            <div
              class="page-image"
              :style="{
                backgroundImage: `url(${cloudinaryBaseUrl + url})`,
                marginLeft: index === 0 && rotation > -90 ? '16px' : '0',
                transform : index === 0 ? `rotate3d(0, 1, 0, ${rotation + 90}deg)` : 'none',
                transformOrigin: 'left'}"
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

export default {
  name: "Book",

  data: () => ({
    publicationCode: 'fr/SPG',
    issueNumber: '100',

    cloudinaryBaseUrl: 'https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/',

    isCoverLoaded: false,
    isEdgeLoaded: false,
    edgeWidth: null,

    edgeUrl: 'https://edges.ducksmanager.net/edges/fr/gen/SPG.100.png',

    rotationInterval: null,
    rotation: 0,
    book: null,
    currentPage: 1,
    currentState: null,
  }),

  computed: {
    ...mapState("coa", ["issueUrls"]),

    pageCount() {
      return this.book && this.book.getPageCount()
    },
    orientation() {
      return this.book && this.book.getOrientation()
    },
    state() {
      return this.book && this.book.getState()
    },

    pages() {
      return this.issueUrls && this.issueUrls['fr/SPG 100']
    },

    isReadyToOpen() {
      return this.isCoverLoaded && this.isEdgeLoaded && this.pages && true
    },
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
              width: 300,
              height: 200,

              size: "stretch",

              maxShadowOpacity: 0.5, // Half shadow intensity
              showCover: true,
              usePortrait: false,
              mobileScrollSupport: false // disable content scrolling on mobile devices
            }
          );
          this.book.loadFromHTML(document.querySelectorAll(".page"));

          this.book
            .on("flip", ({data}) => {
              vm.currentPage = data + 1
            })
            .on("changeState", ({data}) => {
              vm.currentState = data
            })

          this.rotationInterval = setInterval(this.transformEdgeIntoCover, 5)
        }
      }
    }
  },

  async mounted() {
    await this.fetchIssueUrls({
      publicationCode: this.publicationCode,
      issueNumber: this.issueNumber
    });
  },

  methods: {
    ...mapActions("coa", ["fetchIssueUrls"]),

    transformEdgeIntoCover() {
      if (this.rotation > -90) {
        this.rotation--
      }
      else {
        clearInterval(this.transformEdgeIntoCover)
      }
    }
  },
}
</script>

<style scoped lang="scss">
.carousel {
  margin: 25px auto;

  .carousel-item {
    img {
      height: 0 !important;
    }
  }
}

.flip-book {
  display: none;
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

    .page-header {
      height: 30px;
      font-size: 100%;
      text-transform: uppercase;
      text-align: center;
    }

    .page-image {
      height: 100%;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
    }

    .page-text {
      height: 100%;
      flex-grow: 1;
      font-size: 80%;
      text-align: justify;
      margin-top: 10px;
      padding-top: 10px;
      box-sizing: border-box;
      border-top: solid 1px hsl(35, 55, 90);
    }

    .page-footer {
      height: 30px;
      border-top: solid 1px hsl(35, 55, 90);
      font-size: 80%;
      color: hsl(35, 20, 50);
    }
  }

  &.--left { // for left page (property will be added automatically)
    border-right: 0;
    //box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
  }

  &.--right { // for right page (property will be added automatically)
    border-left: 0;
    //box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);

    .page-footer {
      text-align: right;
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


</style>