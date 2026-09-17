<template>
  <b-container
    fluid
    class="d-flex flex-grow-1 h-100 flex-column align-items-center justify-content-center overflow-y-auto"
  >
    <b-alert v-if="csvError" variant="warning" :model-value="true">
      {{ csvError }}</b-alert
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
        <b-form-textarea v-model="csvEntries" name="csv" class="d-none" />
        <b-button type="submit" variant="primary">{{
          $t("Prévisualiser l'indexation sur Inducks")
        }}</b-button>
      </b-form>
    </template>
  </b-container>
</template>
<script setup lang="ts">
import useCsvExport, {
  buildStoriesWithDetails,
} from "~/composables/useCsvExport";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";
import { type storySuggestion } from "~prisma/client_dumili/client";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

const { t: $t } = useI18n();

const { indexation } = storeToRefs(suggestions()) as {
  indexation: Ref<FullIndexation>;
};

const { coa: coaEvents } = inject(dmSocketInjectionKey)!;

const { t } = useI18n();

const acceptedStories = computed(() =>
  indexation.value.entries
    .map((entry) => entry.acceptedStory)
    .filter((story): story is FullEntry["acceptedStory"] => story !== null),
);

const storycodes = computed(() =>
  acceptedStories.value
    .filter(
      (story): story is storySuggestion & { storycode: string } =>
        story?.storycode !== null,
    )
    .map((story) => story.storycode),
);

const storiesWithDetails = computedAsync(
  () =>
    Promise.all([
      coaEvents.getStoriesStoryjobs(storycodes.value),
      coaEvents.getStoriesHeroCharacter(storycodes.value),
    ]).then(([storyjobs, heroCharacter]) =>
      buildStoriesWithDetails(storycodes.value, storyjobs, heroCharacter),
    ),
  {},
);

const { csvEntries, csvError, csvMetadata } = useCsvExport(
  toReactive(indexation),
  toReactive(storiesWithDetails),
  t,
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
