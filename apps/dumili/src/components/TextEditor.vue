<template>
  <b-container
    fluid
    class="d-flex flex-grow-1 h-100 flex-column align-items-center justify-content-center overflow-y-auto"
  >
    <b-alert v-if="!issue" variant="warning" :model-value="true">
      {{
        $t("Vous devez spécifier une publication et un numéro pour continuer")
      }}</b-alert
    >
    <b-alert v-else-if="!rows" variant="warning" :model-value="true">
      {{
        $t("Vous devez identifier au moins une histoire pour continuer")
      }}</b-alert
    >
    <template v-else>
      <b-form-checkbox
        v-model="showEntryLetters"
        :disabled="hasEntrycodesLongerThanFirstColumnMaxWidth"
        class="m-2"
        >{{
          $t("Afficher des lettres au lieu des numéros de pages")
        }}</b-form-checkbox
      >
      <b-form-checkbox v-model="showHorizontalScroll" class="m-2">{{
        $t("Afficher la barre de défilement horizontale")
      }}</b-form-checkbox>
      <div
        class="h-100 overflow-y-auto align-items-start"
        :class="{
          'mw-100 text-nowrap overflow-x-auto': showHorizontalScroll,
        }"
      >
        <b-table head-variant="light" :items="rows" borderless small
          ><template #top-row
            ><b-td>{{ issueRow.issuecode }}</b-td
            ><b-td>{{ issueRow.details }}</b-td
            ><b-td
              v-for="idx in Object.keys(rows![0]).filter((_, idx) => idx >= 2)"
              :key="idx" /></template></b-table
        ><b-button variant="light" @click="copyToClipboard"
          ><template v-if="isCopied">{{ $t("Copié !") }}<i-bi-check /></template
          ><template v-else>{{ $t("Copier") }}</template>
        </b-button>
      </div></template
    ></b-container
  >
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

import { entryColumns, issueColumns } from "~/composables/useTextEditor";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";
import { type storySuggestion } from "~prisma/client_dumili/client";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { storyDetails } = storeToRefs(coa());
const { indexation } = storeToRefs(suggestions());
const { acceptedIssue: issue } = storeToRefs(suggestions());

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const showEntryLetters = ref(false);
const showHorizontalScroll = ref(false);
const isCopied = ref(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(text.value);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};

const acceptedStories = computed(() =>
  indexation.value?.entries
    .map((entry) => entry.acceptedStory)
    .filter((story): story is FullEntry["acceptedStory"] => story !== null),
);

const storiesWithDetails =
  ref<Awaited<ReturnType<typeof getStoriesWithDetails>>>();

const getStoriesWithDetails = (stories: storySuggestion[]) =>
  Promise.all(
    Object.values(stories)
      .filter(
        (story): story is storySuggestion & { storycode: string } =>
          story !== undefined && story.storycode !== null,
      )
      .map(async (story) => {
        const storyjobsResult = await coaEvents.getStoryjobs(story!.storycode);
        const storyjobs =
          "error" in storyjobsResult ? [] : storyjobsResult.data;
        return {
          ...story,
          ...storyDetails.value[story!.storycode],
          storyjobs,
        };
      }),
  );

const issuecode = computed(() =>
  issue.value
    ? `${issue.value.publicationcode.split("/")[1]} ${issue.value.issuenumber}`
    : null,
);

const entrycodesWithPageNumbers = computed(() =>
  indexation.value!.entries.map(
    (entry, idx) =>
      `${issuecode.value}${
        idx === 0
          ? String.fromCharCode(97 + idx)
          : `p${String(entry.position).padStart(3, "0")}`
      }`,
  ),
);

const entrycodesWithLetters = computed(() =>
  indexation.value!.entries.map(
    (_entry, idx) => `${issuecode.value}${String.fromCharCode(97 + idx)}`,
  ),
);

const hasEntrycodesLongerThanFirstColumnMaxWidth = computed(() =>
  entrycodesWithPageNumbers.value.some(
    (entrycode) =>
      entrycode.length >
      entryColumns.find(
        (column) => "field" in column && column.field === "entrycode",
      )!.width,
  ),
);

watch(
  hasEntrycodesLongerThanFirstColumnMaxWidth,
  (value) => {
    if (value) {
      showEntryLetters.value = true;
    }
  },
  { immediate: true },
);

const issueRow = computed(() => ({
  issuecode: issuecode.value,
  details: [
    "h3",
    ...[indexation.value!.price ? [`[price:${indexation.value!.price}]`] : []],
    ...[
      indexation.value!.releaseDate
        ? [`[issdate:${indexation.value!.releaseDate}]`]
        : [],
    ],
    `[inx:${indexation.value!.user.inducksUsername}]`,
    `[pages:${indexation.value!.pages.length}]`,
  ]
    .flat()
    .join(" "),
}));

const rows = computed(() =>
  !storiesWithDetails.value?.length
    ? undefined
    : indexation.value!.entries.map((entry, idx) => {
        const storyWithDetails = storiesWithDetails.value!.find(
          ({ storycode }) => storycode === entry.acceptedStory?.storycode,
        );
        return {
          entrycode:
            idx === 0 ||
            (showEntryLetters.value &&
              !hasEntrycodesLongerThanFirstColumnMaxWidth.value)
              ? entrycodesWithLetters.value[idx]
              : hasEntrycodesLongerThanFirstColumnMaxWidth.value
                ? "->"
                : entrycodesWithPageNumbers.value[idx],
          storycode: entry.acceptedStory?.storycode || "",
          pg: String(getEntryPages(indexation.value!, entry.id).length),
          la:
            entry.acceptedStoryKind?.storyKindRows.kind === "n"
              ? entry.acceptedStoryKind?.storyKindRows.numberOfRows
              : entry.acceptedStoryKind?.storyKindRows.kind,
          _: " ",
          ...(Object.fromEntries(
            (["plot", "writer", "artist", "ink"] as const).map((job) => [
              job,
              storyWithDetails?.storyjobs?.find(
                ({ plotwritartink }) => plotwritartink === job,
              )?.personcode,
            ]),
          ) as { plot: string; writer: string; artist: string; ink: string }),
          hero: "", //story!.printedhero,
          title: `${entry.title || ""}${
            hasEntrycodesLongerThanFirstColumnMaxWidth.value && idx > 0
              ? `[entrycode:${entrycodesWithPageNumbers.value[idx]}]`
              : ""
          }`,
        };
      }),
);

const text = computed(() =>
  [Object.entries(issueRow.value)]
    .concat((rows.value || []).map(Object.entries))
    .map((row, rowIndex) => {
      const columns = rowIndex === 0 ? issueColumns : entryColumns;
      return row
        .map(([thisField, text]) =>
          String(text || "").padEnd(
            columns.find(
              (column) => "field" in column && column.field === thisField,
            )?.width || 0,
          ),
        )
        .join("");
    })
    .join("\n"),
);

watch(
  acceptedStories,
  async (value) => {
    if (value) {
      storiesWithDetails.value = await getStoriesWithDetails(
        value.filter(
          (story): story is NonNullable<typeof story> => story !== null,
        ),
      );
    }
  },
  { immediate: true, deep: true },
);
</script>
<style scoped lang="scss">
textarea {
  z-index: 2;
  font-family: monospace;
  flex-grow: 1;
  background: transparent;
  color: black;
}
:deep(table) {
  text-align: left;
  * {
    color: black;
  }
  $column-colors: (
    // TODO v-bind?
    white,
    #d2ffc4,
    #e3e3e3,
    #ffffcc,
    white,
    #fff284,
    #f2e4d5,
    white,
    #d8f0f8,
    #ffecec,
    white
  );

  @for $i from 1 through length($column-colors) {
    td:nth-of-type(#{$i}) {
      background: nth($column-colors, $i) !important;
    }
  }
}
</style>
