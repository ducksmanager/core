<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <span
      v-for="edge in edgesToLoad"
      :key="getEdgeKey(edge)"
    >
      <Edge
        v-once
        :ref="`edge-${getEdgeKey(edge)}`"
        :key="getEdgeKey(edge)"
        :publication-code="edge.publicationCode"
        :issue-number="edge.issueNumber"
        existing
        load
        @loaded="loadNextEdge"
      />
    </span>
  </div>
  <div
    v-else
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <span
      v-for="edge in edgesToLoad"
      :key="getEdgeKey(edge)"
    >
      <Edge
        :ref="`edge-${getEdgeKey(edge)}`"
        :invisible="currentEdgeOpened === edge"
        :highlighted="currentEdgeHighlighted === getEdgeKey(edge)"
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
    </span>
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

  computed: {
    imagePath: () => window.imagePath,
  },

  mounted() {
    if (!document.querySelector('style#bookshelves')) {
      const {bookshelf: bookshelfTexture} = this.bookcaseTextures
      const bookshelfTextureUrl = `${imagePath}/textures/${bookshelfTexture}.jpg`
      const style = document.createElement('style');
      style.id = 'bookshelves';
      style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
      document.head.append(style);
    }

    this.edgesToLoad = [this.sortedBookcase[0]]
  },

  methods: {
    getEdgeKey: edge => `${edge.publicationCode} ${edge.issueNumber}`,

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