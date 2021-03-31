<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <Edge
      v-for="edge in edgesToLoad"
      v-once
      :id="edge.id"
      :ref="`edge-${edge.id}`"
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
      :id="edge.id"
      :key="`edge-${edge.id}`"
      :ref="`edge-${edge.id}`"
      :invisible="currentEdgeOpened === edge"
      :highlighted="currentEdgeHighlighted === edge.id"
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
    />
  </div>
</template>
<script>
import Edge from "./Edge"

export default {
  name: 'Bookcase',
  components: {Edge},
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
    edgesToLoad: []
  }),

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
    loadNextEdge() {
      const nextEdge = this.sortedBookcase[++this.currentEdgeIndex];
      if (nextEdge) {
        this.edgesToLoad.push(nextEdge)
      }
    }
  }
}
</script>
<style lang="scss" scoped>

.bookcase {
  height: 100%;
  overflow: hidden;
  margin-top: 35px;
  padding: 10px 5px 10px 15px;
  background: transparent repeat left top;
  clear: both;
}

</style>
