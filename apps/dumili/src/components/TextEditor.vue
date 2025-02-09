<template>
  <b-container
    fluid
    class="d-flex flex-grow-1 h-100 flex-column align-items-start"
  >
    <b-alert v-if="!issue" variant="danger" :model-value="true">
      {{
        $t("Vous devez spécifier une publication et un numéro pour continuer")
      }}</b-alert
    >
    <template v-if="acceptedStories">
      <b-form-checkbox v-model="showEntryLetters" class="m-2">{{
        $t("Afficher des lettres au lieu des numéros de pages")
      }}</b-form-checkbox>
      <div class="position-relative d-flex flex-grow-1 w-100">
        <b-form-textarea
          v-model="textContent"
          class="flex-grow-1 p-3"
          :rows="Object.keys(acceptedStories).length + 1"
          readonly
          :disabled="!issue"
          :placeholder="textContentError"
        ></b-form-textarea>
        <div class="column-helpers">
          <div
            v-for="(colMaxLength, idx) in colsMaxLengths?.filter(
              (length) => length,
            )"
            :key="`column-helper-${idx}`"
            class="column-helper"
            :style="{ width: `${colMaxLength * 7.6}px` }"
          ></div>
        </div></div></template
  ></b-container>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";
import type { storySuggestion } from "~prisma/client_dumili";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { storyDetails } = storeToRefs(coa());

const { indexation } = storeToRefs(suggestions());

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const textContentError = ref("");
const { acceptedIssue: issue } = storeToRefs(suggestions());

const showEntryLetters = ref(false);

const acceptedStories = computed(() =>
  indexation.value?.entries
    .map((entry) => entry.acceptedStory)
    .filter((story): story is FullEntry["acceptedStory"] => story !== null),
);

const storiesWithDetails =
  ref<Awaited<ReturnType<typeof getStoriesWithDetails>>>();

const getStoriesWithDetails = async (stories: storySuggestion[]) =>
  await Promise.all(
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

const rows = computed(() => {
  if (!storiesWithDetails.value?.length) {
    return undefined;
  }
  const issuecode = `${issue.value!.publicationcode} ${issue.value!.issuenumber}`;
  return [
    [
      issuecode,
      indexation.value!.price ? [`[price:${indexation.value!.price}]`] : [],
      `[pages:${indexation.value!.pages.length}]`,
    ].flat(),
    ...indexation.value!.entries.map((entry, idx, arr) => {
      const storyWithDetails = storiesWithDetails.value!.find(
        ({ storycode }) => storycode === entry.acceptedStory?.storycode,
      );
      return [
        `${issuecode}${
          showEntryLetters.value
            ? String.fromCharCode(97 + idx)
            : `p${String(arr.slice(0, idx).reduce((acc, _, i) => acc + getEntryPages(indexation.value!, arr[i].id).length, 0) + 1).padStart(3, "0")}`
        }`,
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
});

const colsMaxLengths = computed(() =>
  !rows.value
    ? undefined
    : rows.value[1].map((_, colIndex) =>
        Math.max(
          ...rows
            .value!.filter((_, idx) => idx > 0)
            .map((row) => row[colIndex]?.length || 0),
        ),
      ),
);

const textContent = computed(() => {
  if (!rows.value || !colsMaxLengths.value) {
    return undefined;
  }

  return rows
    .value!.map((row) =>
      row
        .map((col, colIndex) =>
          (col || "").padEnd(colsMaxLengths.value![colIndex], " "),
        )
        .join(" "),
    )
    .join("\n");
});

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
.column-helpers {
  position: absolute;
  display: flex;
  z-index: 1;
  height: 100%;
  left: 0.6rem;
  .column-helper {
    padding: 0 3px;

    $column-colors: (
      white,
      #d2ffc4,
      #ffffcc,
      #fff284,
      #f2e4d5,
      white,
      #d8f0f8,
      #ffecec,
      white
    );

    @for $i from 1 through length($column-colors) {
      &:nth-of-type(#{$i}) {
        background: nth($column-colors, $i) !important;
      }
    }
  }
}
</style>
