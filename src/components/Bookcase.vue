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
      :publication-code="edge.publicationcode"
      :issue-number="edge.issuenumber"
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
      :publication-code="edge.publicationcode"
      :issue-number="edge.issuenumber"
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

<script setup lang="ts">
import { onMounted } from "vue";

import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";

const {
  bookcaseTextures,
  sortedBookcase,
  embedded = false,
  currentEdgeHighlighted = null,
  currentEdgeOpened = null,
  edgesUsingSprites = {},
} = defineProps<{
  embedded?: boolean;
  bookcaseTextures: { bookshelf: string };
  currentEdgeHighlighted?: string;
  currentEdgeOpened?: BookcaseEdgeWithPopularity;
  edgesUsingSprites?: { [edgeId: number]: string };
  sortedBookcase: BookcaseEdgeWithPopularity[] | null;
}>();

defineEmits<{
  (e: "open-book", edgeToLoad: BookcaseEdgeWithPopularity): void;
}>();
let currentEdgeIndex = $ref(0);
let edgesToLoad = $ref([] as BookcaseEdgeWithPopularity[]);

const loadNextEdge = () => {
  const nextEdge = sortedBookcase![++currentEdgeIndex];
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
  edgesToLoad = [sortedBookcase![0]];
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
