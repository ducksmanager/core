<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <Edge
      v-for="(edge, edgeIndex) in sortedBookcase"
      :ref="`edge-${getEdgeKey(edge)}`"
      :key="getEdgeKey(edge)"
      :publication-code="edge.publicationCode"
      :issue-number="edge.issueNumber"
      existing
      :load="currentEdgeIndex >= edgeIndex"
      @loaded="currentEdgeIndex++"
    />
  </div>
  <div
    v-else
    class="bookcase"
    :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`}"
  >
    <Edge
      v-for="(edge, edgeIndex) in sortedBookcase"
      :ref="`edge-${getEdgeKey(edge)}`"
      :key="getEdgeKey(edge)"
      :invisible="currentEdgeOpened === edge"
      :highlighted="currentEdgeHighlighted === getEdgeKey(edge)"
      :publication-code="edge.publicationCode"
      :issue-number="edge.issueNumber"
      :issue-number-reference="edge.issueNumberReference"
      :creation-date="edge.creationDate"
      :popularity="edge.popularity"
      :existing="!!edge.edgeId"
      :sprite-path="edgesUsingSprites[edge.edgeId] || null"
      :load="currentEdgeIndex >= edgeIndex"
      @loaded="currentEdgeIndex++"
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
    currentEdgeIndex: 0
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
  },

  methods: {
    getEdgeKey: edge => `${edge.publicationCode} ${edge.issueNumber}`,
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