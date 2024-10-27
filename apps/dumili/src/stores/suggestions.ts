import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { FullIndexation } from "~dumili-services/indexation/types";
import type { issueSuggestion, storySuggestion } from "~prisma/client_dumili";
import type { inducks_storyversion } from "~prisma-schemas/schemas/coa";
import { stores as webStores } from "~web";

export type storyWithStoryversion = storySuggestion & {
  storyversion: inducks_storyversion;
};

export const suggestions = defineStore("suggestions", () => {
  const { indexationSocket, setIndexationSocketFromId } = inject(
    dumiliSocketInjectionKey,
  )!;
  const { storyversionDetails } = storeToRefs(webStores.coa());
  const indexation = ref<FullIndexation>(),
    acceptedStories = ref<Record<number, storyWithStoryversion | undefined>>(
      {},
    );

  const loadIndexation = async (indexationId: string) => {
    setIndexationSocketFromId(indexationId);
    const data = await indexationSocket.value!.services.loadIndexation();
    if ("error" in data) {
      console.error(data.error);
      return;
    }
    indexation.value = data.indexation;
  };

  const createIssueSuggestion = async (
    suggestion: Pick<
      issueSuggestion,
      "publicationcode" | "issuenumber" | "issuecode" | "source"
    >,
  ) => indexationSocket.value!.services.createIssueSuggestion(suggestion);

  watch(
    () => indexation.value?.entries,
    async (entries) => {
      acceptedStories.value = {};
      for (const {
        id,
        storySuggestions,
        acceptedStorySuggestionId,
      } of entries || []) {
        const acceptedStory = storySuggestions.find(
          (suggestion) => suggestion.id === acceptedStorySuggestionId,
        );

        if (acceptedStory) {
          acceptedStories.value[id] = {
            ...acceptedStory,
            storyversion:
              storyversionDetails.value[acceptedStory!.storyversioncode],
          };
        }
      }
    },
  );

  const acceptedIssue = computed({
    get: () => indexation.value?.acceptedIssueSuggestion,
    set: (value) => (indexation.value!.acceptedIssueSuggestion = value!),
  });

  watch(acceptedIssue, async (acceptedIssue) => {
    indexationSocket.value!.services.acceptIssueSuggestion(
      acceptedIssue?.id || null,
    );
  });

  return {
    indexation,
    loadIndexation,
    createIssueSuggestion,
    hasPendingIssueSuggestions: computed(
      () => false, //pendingIssueSuggestions.value.length > 0
    ),
    acceptedIssue,
    acceptedStories,
    acceptedStoryKinds: computed(() =>
      indexation.value!.entries.groupBy("id", "acceptedStoryKind"),
    ),
  };
});
