<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{
      backgroundImage: `url('/images/textures/${bookcaseTextures.bookcase}.jpg')`,
    }"
  >
    <Edge
      v-for="(edge, edgeId) in edgesToLoad"
      :id="`edge-${edgeId}`"
      :key="`edge-${edgeId}`"
      :publication-code="edge.publicationCode"
      :issue-number="edge.issueNumber"
      existing
      load
      embedded
      @loaded="loadNextEdge"
    />
  </div>
  <div
    v-else
    class="bookcase"
    :style="{
      backgroundImage: `url('/images/textures/${bookcaseTextures.bookcase}.jpg')`,
    }"
  >
    <Edge
      v-for="(edge, edgeId) in edgesToLoad"
      :id="`edge-${edgeId}`"
      :key="`edge-${edgeId}`"
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

<script setup>
import { onMounted } from "vue";

const { bookcaseTextures, sortedBookcase } = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  withAllCopies: {
    type: Boolean,
    default: false,
  },
  bookcaseTextures: {
    type: Object,
    required: true,
  },
  currentEdgeHighlighted: {
    type: String,
    default: null,
  },
  currentEdgeOpened: {
    type: Object,
    default: null,
  },
  edgesUsingSprites: {
    type: Object,
    default: () => ({}),
  },
  sortedBookcase: {
    type: Array,
    required: true,
  },
});

defineEmits(["open-book"]);
let currentEdgeIndex = $ref(0);
let edgesToLoad = $ref([]);

const loadNextEdge = () => {
  const nextEdge = sortedBookcase[++currentEdgeIndex];
  if (nextEdge) edgesToLoad.push(nextEdge);
};

onMounted(() => {
  if (!document.querySelector("style#bookshelves")) {
    const { bookshelf: bookshelfTexture } = bookcaseTextures;
    const bookshelfTextureUrl = `/images/textures/${bookshelfTexture}.jpg`;
    const style = document.createElement("style");
    style.id = "bookshelves";
    style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
    document.head.append(style);
  }
  edgesToLoad = [sortedBookcase[0]];
});
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
