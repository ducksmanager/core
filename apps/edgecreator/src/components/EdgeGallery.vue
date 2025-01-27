<template>
  <div>
    <b-button
      v-if="!isPopulating && hasMoreBefore"
      class="w-100"
      show
      variant="info"
      @click="emit('load-more', 'before')"
    >
      Load more...
    </b-button>
    <gallery
      v-if="items"
      image-type="edges"
      :loading="isPopulating"
      :selected="selected == null ? [] : [selected]"
      :items="items"
      :allow-upload="false"
      @change="emit('change', $event)"
    />
    <b-button
      v-if="!isPopulating && hasMoreAfter"
      class="w-100"
      show
      variant="info"
      @click="emit('load-more', 'after')"
    >
      Load more...
    </b-button>
  </div>
</template>

<script setup lang="ts">
import { edgeCatalog } from "~/stores/edgeCatalog";
import { step } from "~/stores/step";
import type { GalleryItem } from "~/types/GalleryItem";
import { stores as webStores } from "~web";

const { loadDimensionsFromApi, loadStepsFromApi } = useModelLoad();

const {
  selected = null,
  hasMoreBefore = false,
  hasMoreAfter = false,
  publicationcode,
} = defineProps<{
  publicationcode: string;
  selected?: string | null;
  hasMoreBefore?: boolean;
  hasMoreAfter?: boolean;
}>();

const emit = defineEmits<{
  (e: "load-more", where: "before" | "after"): void;
  (e: "change", value: string): void;
}>();

const items = ref<GalleryItem[]>([]);
const isPopulating = ref(false);

const { publishedEdges, publishedEdgesSteps } = storeToRefs(edgeCatalog());
const { loadPublishedEdgesSteps } = edgeCatalog();
const { issuecodesByPublicationcode } = storeToRefs(webStores.coa());
const { fetchIssuecodesByPublicationcode } = webStores.coa();

const populateItems = async (itemsForPublication: { id: number }[]) => {
  const publishedIssueModels = Object.values(itemsForPublication).map(
    ({ id }) => id,
  );
  await loadPublishedEdgesSteps({
    edgeModelIds: publishedIssueModels,
  });
  items.value = (
    await Promise.all(
      Object.keys(itemsForPublication).map(async (issuecode) => {
        const url = `${
          import.meta.env.VITE_EDGES_URL as string
        }/${publicationcode.replace("/", "/gen/")}.${issuecode}.png`;
        let quality;
        let tooltip;
        const allSteps = publishedEdgesSteps.value[issuecode];
        if (!allSteps) {
          quality = 0;
          tooltip = "No steps or dimensions found";
        } else {
          const issueStepWarnings: Record<number, string[]> = {};
          loadDimensionsFromApi(issuecode, allSteps);

          try {
            await loadStepsFromApi(
              issuecode,
              allSteps,
              false,
              (error: string, stepNumber: number) => {
                if (!issueStepWarnings[stepNumber]) {
                  issueStepWarnings[stepNumber] = [];
                }
                issueStepWarnings[stepNumber].push(
                  `Step ${stepNumber}: ${error}`,
                );
              },
            );
          } catch (e) {
            issueStepWarnings[-1] = [e as string];
          }
          const issueSteps = step().getFilteredOptions({
            issuecodes: [issuecode],
          });
          if (!issueSteps.length) {
            issueStepWarnings[0] = ["No steps"];
            quality = 0;
          } else {
            quality = Math.max(
              0,
              1 - Object.keys(issueStepWarnings).length / issueSteps.length,
            );
          }
          tooltip = Object.values(issueStepWarnings).join("\n");
        }
        return {
          name: issuecode,
          quality,
          disabled: quality === 0,
          tooltip,
          url,
        };
      }),
    )
  ).sort(({ name: name1 }, { name: name2 }) =>
    Math.sign(
      issuecodesByPublicationcode.value[publicationcode].indexOf(name1) -
        issuecodesByPublicationcode.value[publicationcode].indexOf(name2),
    ),
  );
};

const onPublicationOrEdgeChange = async () => {
  if (publishedEdges.value) {
    if (!isPopulating.value) {
      isPopulating.value = true;
      await populateItems(
        Object.values(publishedEdges.value).filter(
          ({ publicationcode: publishedEdgePublicationcode }) =>
            publishedEdgePublicationcode === publicationcode,
        ),
      );
      isPopulating.value = false;
    }
  }
};

watch(publishedEdges, onPublicationOrEdgeChange, {
  deep: true,
  immediate: true,
});
watch(
  () => publicationcode,
  async () => {
    await fetchIssuecodesByPublicationcode([publicationcode]);
    onPublicationOrEdgeChange();
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
:deep(.row.gallery) {
  width: 100%;
  height: 200px;
  overflow-y: auto;
}
</style>
