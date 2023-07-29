<template>
  <b-dropdown
    ><b-dropdown-item
      v-for="entrySuggestion of entrySuggestions"
      :key="entrySuggestion.entrycode"
      class="d-flex"
      @click="acceptEntrySuggestion(entrySuggestion.entrycode)"
    >
      {{ entrySuggestion.entrycode || "Contenu inconnu" }}</b-dropdown-item
    >
    <b-dropdown-divider v-if="entrySuggestions.length" />
    <b-dropdown-item @click="showEntrySelect = true">{{
      $t("Personnaliser...")
    }}</b-dropdown-item>
    <template #button-content>
      <div v-if="acceptedEntry.entrycode" class="d-flex">
        {{ acceptedEntry.entrycode
        }}<i-bi-lightbulb-fill
          v-if="acceptedEntry.type === 'ai'"
          class="ms-2"
          color="yellow"
        />
      </div>
      <template v-else-if="showEntrySelect">{{
        $t("Personnaliser...")
      }}</template
      ><template v-else>{{ $t("Contenu inconnu") }}</template></template
    >
  </b-dropdown>
  <IssueSelect
    v-if="showEntrySelect"
    @change="(entrycode) => addCustomEntrycodeToEntrySuggestions(entrycode)"
  />
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import { issueDetails, SuggestedEntry } from "~/stores/issueDetails";

const { t: $t } = useI18n();

const props = defineProps<{
  entryurl: string;
}>();

const showEntrySelect = ref(false);
const issueDetailsStore = issueDetails();

const acceptedEntry = computed(
  () => issueDetailsStore.acceptedEntries[props.entryurl]
);
const entrySuggestions = computed(() =>
  issueDetailsStore.entrySuggestions[props.entryurl].filter(
    ({ storyversion }) =>
      storyversion?.kind === acceptedEntry.value.storyversion?.kind
  )
);

const addCustomEntrycodeToEntrySuggestions = (entrycode: string | null) => {
  if (entrycode) {
    issueDetailsStore.entrySuggestions[props.entryurl] =
      issueDetailsStore.entrySuggestions[props.entryurl].filter(
        ({ type }) => type !== "custom"
      );
    const userSuggestion: SuggestedEntry = {
      entrycode,
      type: "custom",
    };
    issueDetailsStore.entrySuggestions[props.entryurl].push(userSuggestion);
    acceptEntrySuggestion(entrycode);
  }
};

const acceptEntrySuggestion = (entrycode?: string) => {
  issueDetailsStore.acceptEntrySuggestion(props.entryurl, entrycode);
  showEntrySelect.value = false;
};
</script>
