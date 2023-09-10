<template>
  <b-row>
    <b-col>
      <b-form-textarea
        v-model="textContent"
        :rows="Object.keys(acceptedEntries).length + 1"
        readonly
        :placeholder="textContentError"
    /></b-col>
  </b-row>
</template>
<script setup lang="ts">
import { EntrySuggestion, suggestions } from "~/stores/suggestions";

const textContentError = ref("" as string);
const acceptedEntries = computed(() => suggestions().acceptedEntries);

const issue = computed(() => suggestions().acceptedIssue);

const textContent = computed(() => {
  if (!issue.value) {
    return "";
  }
  const rows = [
    [issue.value?.data.issuecode],
    ...(
      Object.values(acceptedEntries.value).filter(
        (entry) => entry !== undefined
      ) as EntrySuggestion[]
    ).map((entry) => [
      entry.data.entrycode,
      entry.data.storyversion?.storyversioncode,
      String(entry.data.storyversion?.entirepages),
      ...["plot", "writer", "artist", "ink"].map(
        (job) =>
          entry.data.storyjobs?.find(
            ({ plotwritartink }) => plotwritartink === job
          )?.personcode
      ),
      entry.data.printedhero,
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
