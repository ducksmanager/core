import { getIndexationSocket } from "~/composables/useDumiliSocket";
import { FullIndexation } from "~dumili-services/indexations/types";
import { Suggestion, SuggestionMetaAi } from "~dumili-types/suggestions";
import { storyKindSuggestion, storySuggestion } from "~prisma/client_dumili";
import { inducks_storyversion } from "~prisma-clients/client_coa";

export const suggestions = defineStore("suggestions", () => {
  const indexation = ref<FullIndexation>(),
    acceptedStories = ref<
      Record<
        number,
        | (storySuggestion & {
            storyversion: inducks_storyversion;
          })
        | undefined
      >
    >({}),
    pendingIssueSuggestions = computed(
      () => indexation.value?.issueSuggestions
    );

  watch(
    indexation,
    async (newIndexation) => {
      if (newIndexation) {
        await getIndexationSocket(newIndexation.id).updateIndexation(
          newIndexation
        );
      }
    },
    { deep: true }
  );

  const acceptSuggestion = <T extends Suggestion>(
    suggestions: T[],
    isAcceptedconditionFn: (suggestion: T) => boolean,
    otherMeta?: {
      source: SuggestionMetaAi["source"];
      status?: SuggestionMetaAi["status"];
    },
    addDataFn?: (suggestion: T) => void
  ) => {
    suggestions.forEach((suggestion) => {
      suggestion.meta.isAccepted = isAcceptedconditionFn(suggestion);
      if (isAcceptedconditionFn(suggestion) && otherMeta) {
        suggestion.meta.source = otherMeta.source;
        if (otherMeta.status) {
          (suggestion.meta as SuggestionMetaAi).status = otherMeta.status;
        }
        addDataFn && addDataFn(suggestion);
      }
    });
  };

  const getAcceptedSuggestion = <T extends Suggestion>(suggestions: T[]) =>
    suggestions.find(({ meta }) => meta.isAccepted);

  const rejectAllSuggestions = <T extends Suggestion>(suggestions: T[]) =>
    suggestions.forEach((suggestion) => (suggestion.meta.isAccepted = false));

  watch(
    () => indexation.value!.entries,
    async () => {
      acceptedStories.value = {};
      for (const {
        id,
        storySuggestions,
        acceptedStorySuggestedId,
      } of indexation.value!.entries) {
        const acceptedStory = storySuggestions.find(
          (suggestion) => suggestion.id === acceptedStorySuggestedId
        )!;

        const storyversion = await coaServices.getStoryversionDetails(
          acceptedStory!.storyversioncode
        );
        if ("error" in storyversion) {
          console.error(storyversion.errorDetails);
        } else {
          acceptedStories.value[id] = {
            ...acceptedStory,
            storyversion,
          };
        }
      }
    }
  );

  return {
    indexation,
    getAcceptedSuggestion,
    acceptSuggestion,
    rejectAllSuggestions,
    hasPendingIssueSuggestions: computed(
      () => pendingIssueSuggestions.value.length > 0
    ),
    acceptedIssue: computed(() => indexation.value!.acceptedIssueSuggestion),
    acceptedStories,
    acceptedStoryKinds: computed(() =>
      indexation.value!.entries.reduce<
        Record<string, storyKindSuggestion | undefined>
      >(
        (acc, { id, storyKindSuggestions, acceptedStoryKindSuggestedId }) => ({
          ...acc,
          [id]: storyKindSuggestions.find(
            (suggestion) => suggestion.id === acceptedStoryKindSuggestedId
          ),
        }),
        {}
      )
    ),
  };
});
