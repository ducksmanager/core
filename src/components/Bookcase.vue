<template>
  <div
    v-if="embedded"
    class="bookcase"
    :style="{
      backgroundImage: getTextureBackgroundImage(bookcaseTextures.bookcase),
    }"
  >
    <Edge
      v-for="(edge, edgeId) in edgesToLoad"
      :id="`edge-${edgeId}`"
      :key="`edge-${edgeId}`"
      :publicationcode="edge.publicationcode"
      :issuenumber="edge.issuenumber"
      existing
      embedded
      @loaded="onEdgeLoaded(edgeId)"
    />
  </div>
  <div
    v-else
    class="bookcase"
    :style="{
      backgroundImage: getTextureBackgroundImage(bookcaseTextures.bookcase),
    }"
  >
    <Edge
      v-for="(edge, edgeIndex) in edgesToLoad"
      :id="`edge-${edgeIndex}`"
      :key="`edge-${edgeIndex}`"
      :invisible="
        currentEdgeOpened === edge ||
        (edgeIndex > currentBatchFirstEdgeIndex &&
          edgeIndex < currentBatchFirstEdgeIndex + batchSize &&
          edgeIndex > lastEdgeIndexContinuouslyLoaded)
      "
      :highlighted="currentEdgeHighlighted === edge.id"
      :publicationcode="edge.publicationcode"
      :issuenumber="edge.issuenumber"
      :issuenumber-reference="edge.issuenumberReference"
      :creation-date="edge.creationDate?.toString()"
      :popularity="edge.popularity || null"
      :existing="!!edge.edgeId"
      :sprite-path="edgesUsingSprites[edge.edgeId] || null"
      @loaded="onEdgeLoaded(edgeIndex)"
      @open-book="$emit('open-book', edge)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";
import { images } from "~/stores/images";

const {
  bookcaseTextures,
  sortedBookcase,
  embedded = false,
  currentEdgeHighlighted = null,
  currentEdgeOpened = null,
  edgesUsingSprites = {},
} = defineProps<{
  embedded?: boolean;
  bookcaseTextures: { bookshelf: string; bookcase: string };
  currentEdgeHighlighted: number | null;
  currentEdgeOpened: BookcaseEdgeWithPopularity | null;
  edgesUsingSprites?: { [edgeId: number]: string };
  sortedBookcase: BookcaseEdgeWithPopularity[] | null;
}>();

const MAX_BATCH_SIZE = 50;

const batchSize = $computed(() =>
  Math.min(
    MAX_BATCH_SIZE,
    (sortedBookcase?.length || 0) - currentBatchFirstEdgeIndex
  )
);

let currentBatchFirstEdgeIndex = $ref(0);
let loadedBatchImages = $ref(new Set<number>() as Set<number>);

const lastEdgeIndexContinuouslyLoaded = $computed(() => {
  const allLoadedImages = Array.from(loadedBatchImages).sort((a, b) =>
    Math.sign(a - b)
  );
  let stop = false;
  return Math.max(
    ...allLoadedImages.filter((edgeIndex, i) => {
      if (stop) {
        return false;
      }
      let isContinuouslyLoadedEdge =
        i === 0 || allLoadedImages.includes(edgeIndex - 1);
      if (!isContinuouslyLoadedEdge) {
        stop = true;
      }
      return isContinuouslyLoadedEdge;
    })
  );
});

defineEmits<{
  (e: "open-book", edgeToLoad: BookcaseEdgeWithPopularity): void;
}>();

const getImagePath = images().getImagePath;
let edgesToLoad = $ref([] as BookcaseEdgeWithPopularity[]);

const getTextureBackgroundImage = (textureName: string) =>
  `url('${getImagePath(`textures/${textureName}`)}.jpg')`;

const loadNextEdgeBatch = () => {
  loadedBatchImages.clear();
  edgesToLoad =
    sortedBookcase?.slice(0, currentBatchFirstEdgeIndex + batchSize) || [];
};

const onEdgeLoaded = (edgeIndex: number) => {
  loadedBatchImages.add(edgeIndex);
};

watch(
  () => loadedBatchImages.size === batchSize,
  (isReadyForNextBatch) => {
    if (isReadyForNextBatch) {
      currentBatchFirstEdgeIndex += batchSize;
      if (currentBatchFirstEdgeIndex < (sortedBookcase?.length || 0)) {
        loadNextEdgeBatch();
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (!document.querySelector("style#bookshelves")) {
    const { bookshelf: bookshelfTexture } = bookcaseTextures;
    const bookshelfTextureUrl = getImagePath(
      `textures/${bookshelfTexture}.jpg`
    );
    const style = document.createElement("style");
    style.id = "bookshelves";
    style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
    document.head.append(style);
  }
  loadNextEdgeBatch();
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
