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
            "Vous avez indiqué toutes les entrées de cette indexation ? Cliquez sur le bouton ci-dessous pour télécharger le fichier CSV correspondant à votre indexation, puis sélectionnez-le ci-dessous pour le prévisualiser sur Inducks. Vous pourrez visualiser une dernière fois l'indexation avant qu'elle soit envoyée à Inducks.",
          )
        }}
      </b-alert>

      <b-button variant="primary" class="mb-3" @click="downloadCsv">{{
        $t("Télécharger le fichier CSV")
      }}</b-button>

      <b-form
        action="https://inducks.org/csvinx.php"
        method="POST"
        enctype="multipart/form-data"
        target="_blank"
      >
        <b-form-input
          :model-value="csvMetadata.issuecode"
          type="text"
          name="issuecode"
          class="d-none"
        />
        <b-form-input
          :model-value="csvMetadata.price"
          type="text"
          name="price"
          class="d-none"
        />
        <b-form-input
          :model-value="csvMetadata.issdate"
          type="text"
          name="issdate"
          class="d-none"
        />
        <b-form-input
          :model-value="csvMetadata.issue_comment"
          type="text"
          name="issue_comment"
          class="d-none"
        />
        <b-form-file v-model="csvFile" name="csvfile" accept="text/csv" />
        <b-button type="submit" variant="primary" :disabled="!csvFile">{{
          $t("Prévisualiser l'indexation sur Inducks")
        }}</b-button>
      </b-form>
    </template>
  </b-container>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

import { getCsvEntries, getCsvMetadata } from "~/composables/useCsvExport";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry } from "~dumili-services/indexation";
import { type storySuggestion } from "~prisma/client_dumili/client";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { indexation } = storeToRefs(suggestions());
const { acceptedIssue: issue } = storeToRefs(suggestions());

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const csvFile = ref<File | null>(null);

const acceptedStories = computed(() =>
  indexation.value?.entries
    .map((entry) => entry.acceptedStory)
    .filter((story): story is FullEntry["acceptedStory"] => story !== null),
);

const storycodes = computed(() =>
  Object.values(acceptedStories.value || {})
    .filter(
      (story): story is storySuggestion & { storycode: string } =>
        story?.storycode !== null,
    )
    .map((story) => story.storycode),
);

const storiesWithDetails = computedAsync(() =>
  Promise.all([
    coaEvents.getStoriesStoryjobs(storycodes.value),
    coaEvents.getStoriesHeroCharacter(storycodes.value),
  ]).then(([storyjobs, heroCharacter]) => {
    const storiesStoryjobs = "error" in storyjobs ? {} : storyjobs.data;
    const heroCharacters = "error" in heroCharacter ? {} : heroCharacter.data;
    return storycodes.value
      .map((storycode) => ({
        storycode,
        heroCharacter:
          storycode in heroCharacters ? heroCharacters[storycode] : null,
        storyjobs:
          storycode in storiesStoryjobs ? storiesStoryjobs[storycode] : [],
      }))
      .groupBy("storycode");
  }),
);

const downloadCsv = () => {
  if (csv.value) {
    const blob = new Blob([csv.value], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "indexation.csv";
    a.click();
  }
};

const csv = computed(() =>
  getCsvEntries(indexation.value!, storiesWithDetails.value!),
);
const csvMetadata = computed(() => getCsvMetadata(indexation.value!));
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
