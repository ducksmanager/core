<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{
      backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`,
    }"
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
    :style="{
      backgroundImage: `url('${imagePath}/textures/${bookcaseTextures.bookcase}.jpg')`,
    }"
  >
    <Edge
      v-for="edge in edgesToLoad"
      :id="`edge-${edge.id}`"
      :key="`edge-${edge.id}`"
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
import Edge from "./Edge";
import { onMounted } from "vue";

const props = defineProps({
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

const currentEdgeIndex = ref(0),
  edgesToLoad = ref([]);

onMounted(() => {
  if (!document.querySelector("style#bookshelves")) {
    const { bookshelf: bookshelfTexture } = props.bookcaseTextures;
    const bookshelfTextureUrl = `${imagePath}/textures/${bookshelfTexture}.jpg`;
    const style = document.createElement("style");
    style.id = "bookshelves";
    style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
    document.head.append(style);
  }
  edgesToLoad.value = [props.sortedBookcase[0]];
});

const loadNextEdge = () => {
  const nextEdge = props.sortedBookcase[++currentEdgeIndex.value];
  if (nextEdge) {
    edgesToLoad.value.push(nextEdge);
  }
};
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
