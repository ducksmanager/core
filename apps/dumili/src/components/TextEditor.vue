<template>
  <b-container fluid class="d-flex flex-grow-1 h-100">
    <b-alert v-if="!issue" variant="danger" :model-value="true">
      {{ $t("You need to specify an issue in the Book tab") }}</b-alert
    >
    <b-form-textarea
      v-model="textContent"
      :rows="Object.keys(acceptedStories).length + 1"
      readonly
      :disabled="!issue"
      :placeholder="textContentError"
    ></b-form-textarea
  ></b-container>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

import { suggestions } from "~/stores/suggestions";
import { getEntryPages } from "~dumili-utils/entryPages";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { storyDetails } = storeToRefs(coa());

const { indexation } = storeToRefs(suggestions());

const {
  coa: { services: coaServices },
} = inject(dmSocketInjectionKey)!;

const textContentError = ref("");
const { acceptedStories, acceptedIssue: issue } = storeToRefs(suggestions());

const storiesWithDetails =
  ref<Awaited<ReturnType<typeof getStoriesWithDetails>>>();

const getStoriesWithDetails = async (
  stories: (typeof acceptedStories)["value"],
) =>
  await Promise.all(
    Object.values(stories)
      .filter((story) => story !== undefined)
      .map(async (story) => ({
        ...story,
        ...storyDetails.value[story!.storycode],
        storyjobs: (await coaServices.getStoryjobs(story!.storycode)).data,
      })),
  );

const textContent = computed(() => {
  if (!storiesWithDetails.value?.length) {
    return undefined;
  }
  const issuecode = issue.value!.issuecode!.split("/")[1];
  const rows = [
    [issuecode],
    ...indexation.value!.entries.map((entry, idx) => {
      const storyWithDetails = storiesWithDetails.value!.find(
        ({ storycode }) => storycode === entry.acceptedStory?.storycode,
      );
      return [
        `${issuecode}${String.fromCharCode(97 + idx)}`,
        entry.acceptedStory?.storycode,
        undefined,
        String(getEntryPages(indexation.value!, entry.id).length),
        ...["plot", "writer", "artist", "ink"].map(
          (job) =>
            storyWithDetails?.storyjobs?.find(
              ({ plotwritartink }) => plotwritartink === job,
            )?.personcode,
        ),
        "", //story!.printedhero,
        entry.title,
      ];
    }),
  ];
  const colsMaxLengths = rows[0].map((_, colIndex) =>
    Math.max(...rows.map((row) => row[colIndex]?.length || 0)),
  );

  return rows
    .map((row) =>
      row
        .map((col, colIndex) =>
          (col || "").padEnd(colsMaxLengths[colIndex], " "),
        )
        .join(" "),
    )
    .join("\n");
});

watch(
  acceptedStories,
  async (value) => {
    if (!issue.value?.issuecode) {
      return undefined;
    }
    storiesWithDetails.value = await getStoriesWithDetails(value);
  },
  { immediate: true, deep: true },
);
</script>
<style scoped lang="scss">
textarea {
  font-family: monospace;
  margin: 2rem 0;
  flex-grow: 1;
}
</style>
