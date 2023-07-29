<template>
  <b-dropdown
    ><b-dropdown-item
      v-for="entrySuggestion of entrySuggestions"
      :key="entrySuggestion.storyversion?.storycode || 'ongoing'"
      class="d-flex"
      @click="
        acceptEntrySuggestion(
          entrySuggestion.storyversion?.storycode || undefined
        )
      "
    >
      {{
        entrySuggestion.storyversion?.storycode || "Contenu inconnu"
      }}</b-dropdown-item
    >
    <b-dropdown-divider v-if="entrySuggestions.length" />
    <b-dropdown-item @click="showEntrySelect = true">{{
      $t("Personnaliser...")
    }}</b-dropdown-item>
    <template #button-content>
      <div v-if="acceptedEntry.storyversion?.storycode" class="d-flex">
        {{ acceptedEntry.storyversion?.storycode
        }}<AiSuggestionIcon v-if="acceptedEntry.type === 'ai'" />
      </div>
      <template v-else-if="showEntrySelect">{{
        $t("Personnaliser...")
      }}</template
      ><template v-else>{{ $t("Contenu inconnu") }}</template></template
    >
  </b-dropdown>
  <StorySearch
    v-if="showEntrySelect"
    @story-selected="addCustomEntrycodeToEntrySuggestions"
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

const addCustomEntrycodeToEntrySuggestions = ({
  storycode,
  title,
}: {
  storycode: string;
  title: string;
}) => {
  if (storycode) {
    const userSuggestion: SuggestedEntry = {
      title,
      storyversion: {
        storycode,
      },
      isAccepted: true,
      type: "custom",
    };
    issueDetailsStore.entrySuggestions[props.entryurl] = [
      ...issueDetailsStore.entrySuggestions[props.entryurl].filter(
        ({ type }) => type === "ai"
      ),
      userSuggestion,
    ];
    acceptEntrySuggestion(storycode);
  }
};

const acceptEntrySuggestion = (storycode?: string) => {
  issueDetailsStore.acceptEntrySuggestion(props.entryurl, storycode);
  showEntrySelect.value = false;
};
</script>
