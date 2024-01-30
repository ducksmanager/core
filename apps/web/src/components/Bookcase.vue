<template>
  <div
    v-if="sortedBookcase"
    class="bookcase"
    :style="{
      backgroundImage: getTextureBackgroundImage(bookcaseTextures.bookcase),
    }"
  >
    <template v-if="embedded">
      <Edge
        v-for="edgeIndex of edgeIndexesToLoad"
        :id="`edge-${edgeIndex}${embedded}`"
        :key="`edge-${edgeIndex}`"
        :publicationcode="sortedBookcase[edgeIndex].publicationcode"
        :issuenumber="sortedBookcase[edgeIndex].issuenumber"
        existing
        embedded
        @loaded="onEdgeLoaded(edgeIndex)"
      />
    </template>
    <template v-else>
      <Edge
        v-for="edgeIndex of edgeIndexesToLoad"
        :id="`edge-${edgeIndex}`"
        :key="`edge-${edgeIndex}`"
        :invisible="
          currentEdgeOpened === sortedBookcaseWithPopularity![edgeIndex] ||
          edgeIndex > lastEdgeIndexContinuouslyLoaded
        "
        :highlighted="
          currentEdgeHighlighted === sortedBookcaseWithPopularity![edgeIndex].id
        "
        :publicationcode="
          sortedBookcaseWithPopularity![edgeIndex].publicationcode
        "
        :issuenumber="sortedBookcaseWithPopularity![edgeIndex].issuenumber"
        :issuenumber-reference="
          sortedBookcaseWithPopularity![edgeIndex].issuenumberReference
        "
        :creation-date="
          sortedBookcaseWithPopularity![edgeIndex].creationDate?.toString()
        "
        :popularity="
          sortedBookcaseWithPopularity![edgeIndex].popularity || null
        "
        :existing="!!sortedBookcaseWithPopularity![edgeIndex].edgeId"
        :sprite-path="
          edgesUsingSprites[sortedBookcaseWithPopularity![edgeIndex].edgeId] ||
          null
        "
        @loaded="onEdgeLoaded(edgeIndex)"
        @open-book="
          $emit('open-book', sortedBookcaseWithPopularity![edgeIndex])
        "
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";

const {
  bookcaseTextures,
  sortedBookcase,
  embedded = false,
  currentEdgeHighlighted = null,
  currentEdgeOpened = null,
  edgesUsingSprites = {},
} = defineProps<
  {
    bookcaseTextures: { bookshelf: string; bookcase: string };
    currentEdgeHighlighted?: number | null;
    currentEdgeOpened?: BookcaseEdgeWithPopularity | null;
    edgesUsingSprites?: { [edgeId: number]: string };
  } & (
    | {
        embedded?: true;
        sortedBookcase:
          | { publicationcode: string; issuenumber: string }[]
          | null;
      }
    | {
        embedded?: false;
        sortedBookcase: BookcaseEdgeWithPopularity[] | null;
      }
  )
>();

const sortedBookcaseWithPopularity = $computed(() =>
  embedded ? undefined : (sortedBookcase as BookcaseEdgeWithPopularity[]),
);

const MAX_BATCH_SIZE = 50;

let loadedImages = $ref(new Set<number>() as Set<number>);

const lastEdgeIndexContinuouslyLoaded = $computed(() => {
  const allLoadedImages = Array.from(loadedImages).sort((a, b) =>
    Math.sign(a - b),
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
    }),
  );
});

defineEmits<{
  (e: "open-book", edgeToLoad: BookcaseEdgeWithPopularity): void;
}>();

const { getImagePath } = images();
let edgeIndexesToLoad = $ref([] as number[]);

const getTextureBackgroundImage = (textureName: string) =>
  `url('${getImagePath(`textures/${textureName}`)}.jpg')`;

const onEdgeLoaded = (edgeIndex: number) => {
  loadedImages.add(edgeIndex);
  const nextEdgeIndexToLoad = sortedBookcase?.findIndex(
    (_, idx) => !edgeIndexesToLoad.includes(idx),
  );
  if (nextEdgeIndexToLoad !== undefined && nextEdgeIndexToLoad > -1) {
    edgeIndexesToLoad.push(nextEdgeIndexToLoad);
  }
};

watch(
  $$(sortedBookcase),
  (newValue) => {
    if (newValue && !edgeIndexesToLoad.length) {
      const firstBatchSize = Math.min(MAX_BATCH_SIZE, newValue.length || 0);
      edgeIndexesToLoad = newValue
        ?.slice(0, firstBatchSize)
        .map((_, idx) => idx);
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
  overflow: hidden;
  margin-top: 35px;
  padding: 10px 5px 10px 15px;
  background: transparent repeat left top;
  clear: both;
}
</style>
