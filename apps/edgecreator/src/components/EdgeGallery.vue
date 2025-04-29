<template>
  <div>
    <b-button
      v-if="!isPopulating && hasMoreIssuesToLoad.before"
      class="w-100"
      show
      variant="info"
      @click="loadMore('before')"
    >
      Load more...
    </b-button>
    <gallery
      v-if="edges"
      v-model="selected"
      v-model:edges="edges"
      image-type="edges"
      :loading="isPopulating"
      :allow-upload="false"
    />
    <b-button
      v-if="!isPopulating && hasMoreIssuesToLoad.after"
      class="w-100"
      show
      variant="info"
      @click="loadMore('after')"
    >
      Load more...
    </b-button>
  </div>
</template>

<script setup lang="ts">
import { edgeCatalog } from "~/stores/edgeCatalog";
import { main } from "~/stores/main";
import { step } from "~/stores/step";
import type { GalleryItem } from "~/types/GalleryItem";
import { stores as webStores } from "~web";

const { loadDimensionsFromApi, loadStepsFromApi } = useModelLoad();

const selected = defineModel<string>();

const { publicationcode, publicationPublishedEdges, publicationIssuecodes } =
  defineProps<{
    publicationcode: string;
    publicationPublishedEdges: Record<string, string>;
    publicationIssuecodes: string[];
  }>();

const { issuecodes } = storeToRefs(main());

const edges = ref<GalleryItem[]>([]);
const isPopulating = ref(false);

const { publishedEdges, publishedEdgesSteps } = storeToRefs(edgeCatalog());
const { loadPublishedEdgesSteps } = edgeCatalog();
const { issuecodesByPublicationcode } = storeToRefs(webStores.coa());

const editingIssuecodeIndexes = computed(() => ({
  min: publicationIssuecodes.indexOf(issuecodes.value[0]),
  max: publicationIssuecodes.indexOf([...issuecodes.value].pop()!),
}));

const surroundingIssuesToLoad = ref({ before: 10, after: 10 } as const);

const hasMoreIssuesToLoad = computed(() => {
  const issuecodesFilter = publicationIssuecodes.filter(
    (issuecode, index) =>
      index >=
        editingIssuecodeIndexes.value.min -
          surroundingIssuesToLoad.value.before &&
      index <=
        editingIssuecodeIndexes.value.max +
          surroundingIssuesToLoad.value.after &&
      !issuecodes.value.includes(issuecode),
  );
  return {
    before: issuecodesFilter[0] !== publicationIssuecodes[0],
    after: [...issuecodesFilter].pop() !== [...publicationIssuecodes].pop(),
  };
});

const loadMore = (where: "before" | "after") => {
  surroundingIssuesToLoad.value = {
    ...surroundingIssuesToLoad.value,
    [where]: surroundingIssuesToLoad.value[where] + 10,
  };
};

const populateItems = async (
  itemsForPublication: {
    id: number;
    issuecode: string;
    url: string;
    svgUrl?: string;
  }[],
) => {
  debugger;
  await loadPublishedEdgesSteps(
    itemsForPublication.filter(({ svgUrl }) => !svgUrl).map(({ id }) => id),
  );
  edges.value = (
    await Promise.all(
      itemsForPublication.map(async ({ issuecode, svgUrl, url }) => {
        debugger;
        let quality;
        let tooltip = "";
        if (svgUrl) {
          quality = 1;
        } else {
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
        }
        return {
          name: issuecode,
          quality,
          disabled: quality === 0,
          tooltip,
          url: `${import.meta.env.VITE_EDGES_URL as string}/${url}`,
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

watch(
  () => publicationcode,
  async () => {
    if (publishedEdges.value && !isPopulating.value) {
      isPopulating.value = true;
      populateItems(Object.values(publishedEdges.value[publicationcode])).then(
        () => {
          isPopulating.value = false;
        },
      );
    }
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
