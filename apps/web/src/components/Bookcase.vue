<template>
  <div
    v-if="sortedBookcase"
    class="bookcase"
    :class="{
      horizontal: orientation === 'horizontal',
    }"
    :style="{
      backgroundImage: getTextureBackgroundImage(bookcaseTextures.bookcase),
    }"
  >
    <template
      v-for="(_, edgeIndex) in edgeCountToLoad"
      :key="`edge-${edgeIndex}`"
    >
      <Edge
        v-if="embedded"
        :id="`edge-${edgeIndex}${embedded}`"
        :issuecode="sortedBookcase![edgeIndex].issuecode"
        :orientation="orientation"
        existing
        embedded
        @loaded="onEdgeLoaded(edgeIndex)"
        ><template #edge-prefix
          ><slot
            name="edge-prefix"
            :edge="{
              issueCondition: sortedBookcase[edgeIndex].issueCondition,
            }" /></template
      ></Edge>
      <Edge
        v-else
        :id="`edge-${edgeIndex}`"
        :invisible="
          currentEdgeOpened === sortedBookcaseWithPopularity![edgeIndex] ||
          edgeIndex > lastEdgeIndexContinuouslyLoaded
        "
        :highlighted="
          currentEdgeHighlighted === sortedBookcaseWithPopularity![edgeIndex].id
        "
        :issuecode="sortedBookcaseWithPopularity![edgeIndex].issuecode!"
        :creation-date="
          sortedBookcaseWithPopularity![edgeIndex].creationDate?.toString()
        "
        :existing="!!sortedBookcaseWithPopularity![edgeIndex].edgeId"
        :slug="sortedBookcaseWithPopularity![edgeIndex].slug"
        :sprite-path="
          edgesUsingSprites?.[
            sortedBookcaseWithPopularity![edgeIndex].edgeId
          ] || null
        "
        :orientation="orientation"
        @loaded="onEdgeLoaded(edgeIndex)"
        @open-book="
          $emit('open-book', sortedBookcaseWithPopularity![edgeIndex])
        "
        ><template #edge-prefix
          ><slot
            name="edge-prefix"
            :edge="{
              issueCondition: sortedBookcase[edgeIndex].issueCondition,
            }" /></template></Edge
    ></template>
  </div>
</template>

<script setup lang="ts">
import { images } from "../stores/images";

import type {
  BookcaseEdgeWithPopularity,
  SimpleBookcaseEdge,
} from "../stores/bookcase";

const {
  bookcaseTextures,
  edgesUsingSprites = {},
  embedded = false,
  currentEdgeHighlighted = null,
  currentEdgeOpened = null,
  orientation = "vertical",
  sortedBookcase,
} = defineProps<
  {
    bookcaseTextures: { bookshelf: string; bookcase: string };
    currentEdgeHighlighted?: number | null;
    currentEdgeOpened?: BookcaseEdgeWithPopularity | null;
    edgesUsingSprites?: { [edgeId: number]: string }; // Never passed!
    orientation?: "vertical" | "horizontal";
  } & (
    | {
        embedded?: true;
        sortedBookcase: SimpleBookcaseEdge[] | null;
      }
    | {
        embedded?: false;
        sortedBookcase: BookcaseEdgeWithPopularity[] | null;
      }
  )
>();

defineSlots<{
  "edge-prefix"(props: {
    edge: Pick<BookcaseEdgeWithPopularity, "issueCondition">;
  }): never;
}>();

const sortedBookcaseWithPopularity = computed(() =>
  embedded ? undefined : (sortedBookcase as BookcaseEdgeWithPopularity[]),
);

const MAX_BATCH_SIZE = 50;

const loadedImages = new Set<number>();
const lastEdgeIndexContinuouslyLoaded = ref(-1);
const edgeCountToLoad = ref(0);
let isFlushScheduled = false;

defineEmits<{
  (e: "open-book", edgeToLoad: BookcaseEdgeWithPopularity): void;
}>();

const { getImagePath } = images();

const getTextureBackgroundImage = (textureName: string) =>
  `url('${getImagePath(`textures/${textureName}`)}.jpg')`;

// Coalesce image loads into a single bookcase re-render per frame
const flushLoadedEdges = () => {
  isFlushScheduled = false;
  let lastIndex = lastEdgeIndexContinuouslyLoaded.value;
  while (loadedImages.has(lastIndex + 1)) lastIndex++;
  lastEdgeIndexContinuouslyLoaded.value = lastIndex;
  edgeCountToLoad.value = Math.min(
    loadedImages.size + MAX_BATCH_SIZE,
    sortedBookcase?.length || 0,
  );
};

const onEdgeLoaded = (edgeIndex: number) => {
  loadedImages.add(edgeIndex);
  if (!isFlushScheduled) {
    isFlushScheduled = true;
    requestAnimationFrame(flushLoadedEdges);
  }
};

watch(
  () => sortedBookcase,
  (newValue) => {
    if (newValue && !edgeCountToLoad.value) {
      edgeCountToLoad.value = Math.min(MAX_BATCH_SIZE, newValue.length);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!document.querySelector("style#bookshelves")) {
    const { bookshelf: bookshelfTexture } = bookcaseTextures;
    const bookshelfTextureUrl = getImagePath(
      `textures/${bookshelfTexture}.jpg`,
    );
    const style = document.createElement("style");
    style.id = "bookshelves";
    style.textContent = `.edge:not(.visible-book)::after { background: url("${bookshelfTextureUrl}");}`;
    document.head.append(style);
  }
});
</script>

<style lang="scss" scoped>
.bookcase {
  height: 100%;
  padding: 10px 5px 10px 15px;
  overflow: hidden;
  background: transparent repeat left top;
  clear: both;

  &.horizontal {
    overflow-y: auto;
  }
}
</style>
