<template>
  <b-container fluid>
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

import { injectLocal } from "@vueuse/core";

import { suggestions } from "~/stores/suggestions";
import { dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const {
  coa: { services: coaServices },
} = injectLocal(dmSocketInjectionKey)!;

const textContentError = ref("");
const { acceptedStories, acceptedIssue: issue } = storeToRefs(suggestions());

const storiesWithDetails =
  ref<Awaited<ReturnType<typeof getStoriesWithDetails>>>();

watch(
  acceptedStories,
  async (value) => {
    if (!issue.value?.issuecode) {
      return undefined;
    }
    storiesWithDetails.value = await getStoriesWithDetails(value);
  },
  { immediate: true, deep: true }
);

const getStoriesWithDetails = async (
  stories: (typeof acceptedStories)["value"]
) =>
  await Promise.all(
    Object.values(stories)
      .filter((story) => story !== undefined)
      .map(async (story) => ({
        ...story,
        ...(await coaServices.getStoryDetails(story!.storyversioncode)).data,
        storyversion: (
          await coaServices.getStoryversionDetails(story!.storyversioncode)
        ).data,
        storyjobs: (await coaServices.getStoryjobs(story!.storyversioncode))
          .data,
      }))
  );

const textContent = computed(() => {
  if (!storiesWithDetails.value?.length) {
    return undefined;
  }
  const issuecode = issue.value!.issuecode!.split("/")[1];
  const rows = [
    [issuecode],
    ...storiesWithDetails.value.map((story, idx) => [
      `${issuecode}${String.fromCharCode(97 + idx)}`,
      story!.storyversion?.storycode,
      undefined,
      String(story!.storyversion?.entirepages || 1),
      ...["plot", "writer", "artist", "ink"].map(
        (job) =>
          story!.storyjobs?.find(({ plotwritartink }) => plotwritartink === job)
            ?.personcode
      ),
      "", //story!.printedhero,
      story!.title,
    ]),
  ];
  const colsMaxLengths = rows.reduce<number[]>((acc, row) => {
    row.forEach((col, i) => {
      acc[i] = Math.max(acc[i], col?.length || 0);
    });
    return acc;
  }, []);

  return rows
    .map((row) =>
      row
        .map((col, colIndex) =>
          (col || "").padEnd(colsMaxLengths[colIndex], " ")
        )
        .join(" ")
    )
    .join("\n");
});
</script>
<style scoped lang="scss">
textarea {
  font-family: monospace;
}
</style>
