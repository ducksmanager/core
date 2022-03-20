<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <Edge
      v-for="edge in edgesToLoad"
      v-once
      :id="`edge-${edge.id}`"
      :key="`edge-${edge.id}`"
      :publication-code="edge.publicationCode"
      :issue-number="edge.issueNumber"
      existing
      load
      @loaded="loadNextEdge"
    />
  </div>
  <div
    v-else
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <Edge
      v-for="edge in edgesToLoad"
      :id="`edge-${edge.id}`"
      :key="`edge-${edge.id}`"
      :invisible="currentEdgeOpened === edge"
      :highlighted="currentEdgeHighlighted === edge.id"
      :peeked="peekedEdge && peekedEdge.id === edge.id"
      :publication-code="edge.publicationCode"
      :issue-number="edge.issueNumber"
      :issue-number-reference="edge.issueNumberReference"
      :creation-date="edge.creationDate"
      :popularity="edge.popularity"
      :existing="!!edge.edgeId"
      :sprite-path="edgesUsingSprites[edge.edgeId] || null"
      load
      @loaded="loadNextEdge"
      @open-book="$emit('open-book', edge)"
      @peek-edge="peekedEdge = edge"
      @unpeek-edge="peekedEdge = null"
    />
    <img
      v-show="peekedCover"
      class="cover-peek"
      :class="{visible: !!peekedEdgeElement}"
      :src="cloudinaryBaseUrl + peekedCover"
      :style="peekedEdgeElement ? {
        top: `${peekedEdgeElement.offsetTop}px`,
        left: `${peekedEdgeElement.offsetLeft - 15 + peekedEdgeElement.clientWidth}px`,
        width: `${peekedEdgeElement.clientWidth * 10}px`,
        height: `${peekedEdgeElement.clientHeight - 25}px`,
      } : {}"
      @load="({target}) => { coverRatio = target.naturalHeight/target.naturalWidth }"
    >
  </div>
</template>
<script>
import Edge from "./Edge"
import bookMixin from "../mixins/bookMixin";
import { mapActions } from "pinia";
import { coa } from "../stores/coa";

export default {
  name: 'Bookcase',
  components: {Edge},
  mixins: [bookMixin],
  props: {
    embedded: {
      type: Boolean,
      default: false
    },
    withAllCopies: {
      type: Boolean,
      default: false
    },
    bookcaseTextures: {
      type: Object,
      required: true
    },
    currentEdgeHighlighted: {
      type: String,
      default: null
    },
    currentEdgeOpened: {
      type: Object,
      default: null
    },
    edgesUsingSprites: {
      type: Object,
      default: () => ({})
    },
    sortedBookcase: {
      type: Array,
      required: true
    }
  },
  emits: ['open-book'],

  data: () => ({
    currentEdgeIndex: 0,
    edgesToLoad: [],
    peekedEdge: null,
    peekedCover: null,
    pages: []
  }),

  computed: {
    peekedEdgeElement() {
      return this.peekedEdge && document.getElementById(`edge-${this.peekedEdge.id}-wrapper`)
    }
  },

  watch: {
    async peekedEdge(edge) {
      if (edge) {
        let publicationCode = `${edge.countryCode}/${edge.magazineCode}`;
        await this.loadBookPages(publicationCode, edge.issueNumber)
        const issueDetails = this.getIssueDetails(publicationCode, edge.issueNumber)
        this.peekedCover = issueDetails && issueDetails.entries && issueDetails.entries[0] ? issueDetails.entries[0].url : null
      }
    }
  },

  mounted() {
    if (!document.querySelector('style#bookshelves')) {
      const {bookshelf: bookshelfTexture} = this.bookcaseTextures
      const bookshelfTextureUrl = `${this.imagePath}/textures/${bookshelfTexture}.jpg`
      const style = document.createElement('style');
      style.id = 'bookshelves';
      style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
      document.head.append(style);
    }

    this.edgesToLoad = [this.sortedBookcase[0]]
  },

  methods: {
    ...mapActions(coa, ['getIssueDetails']),
    loadNextEdge() {
      const nextEdge = this.sortedBookcase[++this.currentEdgeIndex];
      if (nextEdge) {
        this.edgesToLoad.push(nextEdge)
      }
    },
  }
}
</script>
<style lang="scss" scoped>

.bookcase {
  position: relative;
  height: 100%;
  overflow: hidden;
  margin-top: 35px;
  padding: 10px 5px 10px 15px;
  background: transparent repeat left top;
  clear: both;

  .cover-peek {
    position: absolute;
    margin-left: 15px;
    margin-top: 20px;
    border: 1px solid black;
    transform-origin: left;
    transform: rotateY(90deg);
    transition: transform 1s linear;

    &.visible {
      transform: rotateY(70deg);
    }
  }
}

</style>
