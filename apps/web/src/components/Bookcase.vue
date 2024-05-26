<template>
  <div
    v-if="sortedBookcase"
    class="bookcase"
    :style="{
      backgroundImage: getTextureBackgroundImage(bookcaseTextures.bookcase),
    }"
  >
    <template v-for="edgeIndex of edgeIndexesToLoad" :key="`edge-${edgeIndex}`">
      <Edge
        v-if="embedded"
        :id="`edge-${edgeIndex}${embedded}`"
        v-bind="
          (({ publicationcode, issueCondition, issuenumber }) => ({
            publicationcode,
            issueCondition,
            issuenumber,
          }))(sortedBookcase[edgeIndex] as SimpleBookcaseEdge)
        "
        :orientation="orientation"
        existing
        embedded
        @loaded="onEdgeLoaded(edgeIndex)"
        ><template #edge-prefix="{ edge }"
          ><slot
            name="edge-prefix"
            :edge="{
              issueCondition: edge.issueCondition!,
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
        v-bind="
          (({
            publicationcode,
            issueCondition,
            issuenumber,
            issuenumberReference,
            popularity,
          }: BookcaseEdgeWithPopularity) => ({
            publicationcode,
            issueCondition,
            issuenumber,
            issuenumberReference,
            popularity,
          }))(sortedBookcaseWithPopularity![edgeIndex])
        "
        :creation-date="
          sortedBookcaseWithPopularity![edgeIndex].creationDate?.toString()
        "
        :existing="!!sortedBookcaseWithPopularity![edgeIndex].edgeId"
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
        ><template #edge-prefix="{ edge }"
          ><slot
            name="edge-prefix"
            :edge="{
              issueCondition: edge.issueCondition!,
            }" /></template></Edge
    ></template>
  </div>
</template>

<script setup lang="ts">
import {
  BookcaseEdgeWithPopularity,
  SimpleBookcaseEdge,
} from "../stores/bookcase";
import { images } from "../stores/images";

const {
  bookcaseTextures,
  edgesUsingSprites,
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
    edgesUsingSprites?: { [edgeId: number]: string };
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

let loadedImages = ref(new Set<number>() as Set<number>);

const lastEdgeIndexContinuouslyLoaded = computed(() => {
  const allLoadedImages = Array.from(loadedImages.value).sort((a, b) =>
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
let edgeIndexesToLoad = ref([] as number[]);

const getTextureBackgroundImage = (textureName: string) =>
  `url('${getImagePath(`textures/${textureName}`)}.jpg')`;

const onEdgeLoaded = (edgeIndex: number) => {
  loadedImages.value.add(edgeIndex);
  const nextEdgeIndexToLoad = sortedBookcase?.findIndex(
    (_, idx) => !edgeIndexesToLoad.value.includes(idx),
  );
  if (nextEdgeIndexToLoad !== undefined && nextEdgeIndexToLoad > -1) {
    edgeIndexesToLoad.value.push(nextEdgeIndexToLoad);
  }
};

watch(
  () => sortedBookcase,
  (newValue) => {
    if (newValue && !edgeIndexesToLoad.value.length) {
      const firstBatchSize = Math.min(MAX_BATCH_SIZE, newValue.length || 0);
      edgeIndexesToLoad.value = newValue
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
  background: transparent repeat left top;
  clear: both;

  &.vertical {
    margin-top: 35px;
    padding: 10px 5px 10px 15px;
  }
}
</style>
