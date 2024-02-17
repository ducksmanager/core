import { getIndexationSocket } from "~/composables/useDumiliSocket";
import {
  EntrySuggestion,
  IssueSuggestion,
  StoryversionKindSuggestion,
  Suggestion,
  SuggestionMetaAi,
} from "~dumili-types/suggestions";

export const suggestions = defineStore("suggestions", () => {
  const indexationId = ref<string>();
  const entries = ref<{ url: string; suggestions: EntrySuggestion[] }[]>([]),
    storyversionKinds = ref<
      { url: string; suggestions: StoryversionKindSuggestion[] }[]
    >([]),
    issueSuggestions = ref<IssueSuggestion[]>([]),
    pendingIssueSuggestions = computed(() =>
      issueSuggestions.value.filter(({ meta }) => meta.isAccepted === undefined)
    );

  watch(
    [entries, storyversionKinds],
    async ([newEntrySuggestions, newStoryversionKindSuggestions]) => {
      for (const {
        url,
        suggestions: suggestionsForUrl,
      } of newEntrySuggestions) {
        await getIndexationSocket(indexationId.value!).updateIndexationResource(
          url,
          {
            entrySuggestions: suggestionsForUrl,
            storyversionKindSuggestions: newStoryversionKindSuggestions.find(
              ({ url: thisUrl }) => url === thisUrl
            )!.suggestions,
          }
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

  return {
    indexationId,
    entries,
    storyversionKinds,
    issueSuggestions,
    getAcceptedSuggestion,
    acceptSuggestion,
    rejectAllSuggestions,
    hasPendingIssueSuggestions: computed(
      () => pendingIssueSuggestions.value.length > 0
    ),
    acceptedIssue: computed(() =>
      getAcceptedSuggestion(issueSuggestions.value)
    ),
    acceptedEntries: computed(() =>
      entries.value.reduce<Record<string, EntrySuggestion | undefined>>(
        (acc, { url, suggestions }) => ({
          ...acc,
          [url]: getAcceptedSuggestion(suggestions),
        }),
        {}
      )
    ),
    acceptedStoryversionKinds: computed(() =>
      storyversionKinds.value.reduce<
        Record<string, StoryversionKindSuggestion | undefined>
      >(
        (acc, { url, suggestions }) => ({
          ...acc,
          [url]: getAcceptedSuggestion(suggestions),
        }),
        {}
      )
    ),
  };
});
