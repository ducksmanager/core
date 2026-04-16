<template>
  <b-container
    fluid
    class="d-flex flex-grow-1 h-100 flex-column align-items-center justify-content-center overflow-y-auto"
  >
    <b-alert v-if="!issue" variant="warning" :model-value="true">
      {{
        $t(
          'Vous devez spécifier une publication et un numéro pour continuer (cliquez sur la liste déroulante qui indique actuellement "Numéro inconnu")',
        )
      }}</b-alert
    >
    <b-alert
      v-if="!indexation!.releaseDate"
      variant="warning"
      :model-value="true"
    >
      {{
        $t(
          'Vous devez spécifier la date de sortie du numéro dans "Méta-données" pour continuer',
        )
      }}</b-alert
    >
    <b-alert v-else-if="!csv" variant="warning" :model-value="true">
      {{
        $t("Vous devez identifier au moins une histoire pour continuer")
      }}</b-alert
    >
    <template v-else>
      <b-alert variant="info" :model-value="true">
        {{
          $t(
            "Vous avez indiqué toutes les entrées de cette indexation ? Cliquez sur le bouton ci-dessous pour prévisualiser l'indexation sur Inducks. Vous pourrez visualiser une dernière fois l'indexation avant de l'envoyer.",
          )
        }}
      </b-alert>
      <b-form
        action="https://inducks.org/csvinx.php"
        method="POST"
        target="_blank"
      >
        <b-form-input
          v-model="issuecode"
          type="text"
          name="issuecode"
          class="d-none"
        />
        <b-form-input
          v-model="indexation!.price"
          type="text"
          name="price"
          class="d-none"
        />
        <b-form-input
          v-model="indexation!.releaseDate"
          type="text"
          name="issdate"
          class="d-none"
        />
        <b-form-textarea name="csv" :model-value="csv" class="d-none" />
        <b-button type="submit" variant="primary">{{
          $t("Prévisualiser l'indexation sur Inducks")
        }}</b-button>
      </b-form>
    </template>
  </b-container>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";
import { type storySuggestion } from "~prisma/client_dumili/client";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { storyDetails } = storeToRefs(coa());
const { indexation } = storeToRefs(suggestions());
const { acceptedIssue: issue } = storeToRefs(suggestions());

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

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
    ? `${issue.value.publicationcode} ${issue.value.issuenumber}`
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

const csv = computed(() => {
  if (!storiesWithDetails.value?.length) {
    return undefined;
  } else {
    const data = indexation.value!.entries.map((entry, idx) => {
      const storyWithDetails = storiesWithDetails.value!.find(
        ({ storycode }) => storycode === entry.acceptedStory?.storycode,
      );
      return {
        entrycode: entrycodesWithPageNumbers.value[idx],
        storycode: entry.acceptedStory?.storycode || "",
        pg: String(getEntryPages(indexation.value!, entry.id).length),
        ...(Object.fromEntries(
          (["plot", "writ", "art", "ink"] as const).map((job) => [
            job,
            storyWithDetails?.storyjobs?.find(
              ({ plotwritartink }) => plotwritartink === job,
            )?.personcode,
          ]),
        ) as { plot: string; writ: string; art: string; ink: string }),
        la:
          entry.acceptedStoryKind?.storyKindRows.kind === "n"
            ? entry.acceptedStoryKind?.storyKindRows.numberOfRows
            : entry.acceptedStoryKind?.storyKindRows.kind,
        title: entry.title || "",
      };
    });

    return [Object.keys(data[0]), ...data.map((row) => Object.values(row))]
      .map((row) => row.join(";"))
      .join("\n");
  }
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
@use "sass:list";
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

  @for $i from 1 through list.length($column-colors) {
    td:nth-of-type(#{$i}) {
      background: list.nth($column-colors, $i) !important;
    }
  }
}
</style>
