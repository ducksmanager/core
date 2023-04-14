<template>
  <div>
    <b-button
      v-if="!isPopulating && hasMoreBefore"
      class="w-100"
      show
      variant="info"
      @click="emit('load-more', 'before')"
      >Load more...</b-button
    >
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
      >Load more...</b-button
    >
  </div>
</template>

<script setup lang="ts">
import { coa } from "~/stores/coa";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { step } from "~/stores/step";
import { GalleryItem } from "~/types/GalleryItem";

const { loadDimensionsFromApi, loadStepsFromApi } = useModelLoad();

const props = withDefaults(
  defineProps<{
    publicationcode: string;
    selected?: string | null;
    hasMoreBefore?: boolean;
    hasMoreAfter?: boolean;
  }>(),
  { selected: null, hasMoreBefore: false, hasMoreAfter: false }
);

const emit = defineEmits<{
  (e: "load-more", where: "before" | "after"): void;
  (e: "change", value: string): void;
}>();
const items = ref([] as GalleryItem[]);
const isPopulating = ref(false as boolean);

const publishedEdges = computed(() => edgeCatalog().publishedEdges);
const publishedEdgesSteps = computed(() => edgeCatalog().publishedEdgesSteps);
const issueNumbers = computed(() => coa().issueNumbers);

const populateItems = async (
  publicationcode: string,
  itemsForPublication: Record<string, { modelId?: number; v3: boolean }>
) => {
  const [countryCode, magazineCode] = publicationcode.split("/");
  const publishedIssueModels = Object.values(itemsForPublication)
    .filter(({ modelId }) => !!modelId)
    .map(({ modelId }) => modelId);
  await edgeCatalog().getPublishedEdgesSteps({
    publicationcode: props.publicationcode,
    edgeModelIds: publishedIssueModels as number[],
  });
  items.value = (
    await Promise.all(
      Object.keys(itemsForPublication).map(async (issuenumber) => {
        const url = `${
          import.meta.env.VITE_EDGES_URL as string
        }/${countryCode}/gen/${magazineCode}.${issuenumber}.png`;
        if (itemsForPublication[issuenumber].v3) {
          return {
            name: issuenumber,
            quality: 1,
            disabled: false,
            tooltip: "",
            url,
          };
        }
        let quality;
        let tooltip;
        const allSteps =
          publishedEdgesSteps.value[props.publicationcode][issuenumber];
        if (!allSteps) {
          quality = 0;
          tooltip = "No steps or dimensions found";
        } else {
          const issueStepWarnings: Record<number, string[]> = {};
          loadDimensionsFromApi(issuenumber, allSteps);

          const dimensions = step().getFilteredDimensions({
            issuenumbers: [issuenumber],
          });
          if (!dimensions.length) {
            issueStepWarnings[-1] = ["No dimensions"];
          }
          await loadStepsFromApi(
            props.publicationcode,
            issuenumber,
            allSteps,
            dimensions[0],
            false,
            (error: string, stepNumber: number) => {
              if (!issueStepWarnings[stepNumber]) {
                issueStepWarnings[stepNumber] = [];
              }
              issueStepWarnings[stepNumber].push(
                `Step ${stepNumber}: ${error}`
              );
            }
          );
          const issueSteps = step().getFilteredOptions({
            issuenumbers: [issuenumber],
          });
          if (!issueSteps.length) {
            issueStepWarnings[0] = ["No steps"];
            quality = 0;
          } else {
            quality = Math.max(
              0,
              1 - Object.keys(issueStepWarnings).length / issueSteps.length
            );
          }
          tooltip = Object.values(issueStepWarnings).join("\n");
        }
        return {
          name: issuenumber,
          quality,
          disabled: quality === 0,
          tooltip,
          url,
        };
      })
    )
  ).sort(({ name: name1 }, { name: name2 }) =>
    Math.sign(
      issueNumbers.value[props.publicationcode].indexOf(name1) -
        issueNumbers.value[props.publicationcode].indexOf(name2)
    )
  );
};

const onPublicationOrEdgeChange = async () => {
  if (publishedEdges.value[props.publicationcode]) {
    if (!isPopulating.value) {
      isPopulating.value = true;
      await populateItems(
        props.publicationcode,
        publishedEdges.value[props.publicationcode]
      );
      isPopulating.value = false;
    }
  }
};

watch(() => publishedEdges.value, onPublicationOrEdgeChange, {
  deep: true,
  immediate: true,
});
watch(() => props.publicationcode, onPublicationOrEdgeChange, {
  immediate: true,
});
</script>

<style scoped>
:deep(.row.gallery) {
  width: 100%;
  height: 200px;
  overflow-y: auto;
}
</style>
