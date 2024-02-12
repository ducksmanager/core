<template>
  <b-container fluid>
    <b-alert v-if="!issue" variant="danger" :model-value="true">
      {{ $t("You need to specify an issue in the Book tab") }}</b-alert
    >
    <b-form-textarea
      v-model="textContent"
      :rows="Object.keys(acceptedEntries).length + 1"
      readonly
      :disabled="!issue"
      :placeholder="textContentError"
    ></b-form-textarea
  ></b-container>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

import { suggestions } from "~/stores/suggestions";
import { EntrySuggestion } from "~dumili-types/suggestions";

const textContentError = ref("");
const acceptedEntries = computed(() => suggestions().acceptedEntries);

const issue = computed(() => suggestions().acceptedIssue);

const textContent = computed(() => {
  if (!issue.value) {
    return undefined;
  }
  const shortIssuecode = issue.value?.data.issuecode.split("/")[1];
  const rows = [
    [shortIssuecode],
    ...(
      Object.values(acceptedEntries.value).filter(
        (entry) => entry !== undefined
      ) as EntrySuggestion[]
    ).map((entry, idx) => [
      `${shortIssuecode}${String.fromCharCode(97 + idx)}`,
      entry.data.storyversion?.storycode,
      String(entry.data.storyversion?.entirepages || 1),
      ...["plot", "writer", "artist", "ink"].map(
        (job) =>
          entry.data.storyjobs?.find(
            ({ plotwritartink }) => plotwritartink === job
          )?.personcode
      ),
      entry.data.printedhero,
      entry.data.title,
    ]),
  ];
  const colsMaxLengths = rows.reduce<number[]>((acc, row) => {
    row.forEach((col, i) => {
      acc[i] = Math.max(acc[i], col?.length || 0);
    });
    return acc;
  }, [] as number[]);

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

watch(
  () => issue.value,
  () => {
    if (!issue.value) {
      textContentError.value = "No data";
    }
  },
  { immediate: true }
);
</script>
<style scoped lang="scss">
textarea {
  font-family: monospace;
}
</style>
