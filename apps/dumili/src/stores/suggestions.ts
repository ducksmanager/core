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
  const { services: coaServices } = webStores.coa();
  const indexation = ref<FullIndexation>(),
    acceptedStories = ref<Record<number, storyWithStoryversion | undefined>>(
      {},
    );
  const entriesFirstPages = computed(() => {
    const firstPages: {
      entryId: number;
      startsAtPage: number;
      endsAtPage: number;
    }[] = [];
    let pageCounter = 0;
    for (const { id, entryPages } of indexation.value?.entries || []) {
      if (firstPages.length) {
        firstPages[firstPages.length - 1].endsAtPage = pageCounter - 1;
      }
      firstPages.push({
        entryId: id,
        startsAtPage: pageCounter,
        endsAtPage: pageCounter,
      });

      pageCounter += entryPages.length;
    }
    if (firstPages.length) {
      firstPages[firstPages.length - 1].endsAtPage = pageCounter - 1;
    }
    return firstPages;
  });

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
        acceptedStorySuggestedId,
      } of entries || []) {
        const acceptedStory = storySuggestions.find(
          (suggestion) => suggestion.id === acceptedStorySuggestedId,
        );

        if (acceptedStory) {
          const storyversion = await coaServices.getStoryversionDetails(
            acceptedStory!.storyversioncode,
          );
          if ("error" in storyversion) {
            console.error(storyversion.errorDetails);
          } else {
            acceptedStories.value[id] = {
              ...acceptedStory,
              storyversion: storyversion.data,
            };
          }
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
    entriesFirstPages,
    hasPendingIssueSuggestions: computed(
      () => false, //pendingIssueSuggestions.value.length > 0
    ),
    acceptedIssue,
    acceptedStories,
    acceptedStoryKinds: computed(() =>
      indexation.value!.entries.groupBy("id", "acceptedSuggestedStoryKind"),
    ),
  };
});
