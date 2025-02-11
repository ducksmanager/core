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
      <b-table head-variant="light" :items="rows" borderless small
        ><template #top-row
          ><b-td>{{ issueRow.issuecode }}</b-td
          ><b-td>{{ issueRow.details }}</b-td
          ><b-td
            v-for="idx in Object.keys(rows![0]).filter((_, idx) => idx >= 2)"
            :key="idx" /></template></b-table></template
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

const issuecode = computed(
  () => `${issue.value!.publicationcode} ${issue.value!.issuenumber}`,
);

const issueRow = computed(() => ({
  issuecode: issuecode.value,
  details: [
    ...[indexation.value!.price ? [`[price:${indexation.value!.price}]`] : []],
    `[pages:${indexation.value!.pages.length}]`,
  ]
    .flat()
    .join(" "),
}));

const rows = computed(() =>
  !storiesWithDetails.value?.length
    ? undefined
    : indexation.value!.entries.map((entry, idx, arr) => {
        const storyWithDetails = storiesWithDetails.value!.find(
          ({ storycode }) => storycode === entry.acceptedStory?.storycode,
        );
        return {
          entrycode: `${issuecode.value}${
            showEntryLetters.value
              ? String.fromCharCode(97 + idx)
              : `p${String(arr.slice(0, idx).reduce((acc, _, i) => acc + getEntryPages(indexation.value!, arr[i].id).length, 0) + 1).padStart(3, "0")}`
          }`,
          storycode: entry.acceptedStory?.storycode,
          pg: String(getEntryPages(indexation.value!, entry.id).length),
          la: "", // entry.acceptedStorykind
          ...Object.fromEntries(
            ["plot", "writer", "artist", "ink"].map((job) => [
              job,
              storyWithDetails?.storyjobs?.find(
                ({ plotwritartink }) => plotwritartink === job,
              )?.personcode,
            ]),
          ),
          hero: "", //story!.printedhero,
          title: entry.title,
        };
      }),
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
    white,
    #d2ffc4,
    #e3e3e3,
    #ffffcc,
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
