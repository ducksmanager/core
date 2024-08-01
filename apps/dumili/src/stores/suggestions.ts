import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { FullIndexation } from "~dumili-services/indexations/types";
import { storyKindSuggestion, storySuggestion } from "~prisma/client_dumili";
import { inducks_storyversion } from "~prisma-clients/schemas/coa";

export type storyWithStoryversion = storySuggestion & {
  storyversion: inducks_storyversion;
};

export const suggestions = defineStore("suggestions", () => {
  const {
    getIndexationSocket,
    coa: { services: coaServices },
  } = inject(dumiliSocketInjectionKey)!;
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
    const data =
      await getIndexationSocket(indexationId).services.loadIndexation();
    if ("error" in data) {
      console.error(data.error);
      return;
    }
    indexation.value = data.indexation;
  };

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

  return {
    indexation,
    loadIndexation,
    entriesFirstPages,
    hasPendingIssueSuggestions: computed(
      () => false, //pendingIssueSuggestions.value.length > 0
    ),
    acceptedIssue: computed(() => indexation.value!.acceptedIssueSuggestion),
    acceptedStories,
    acceptedStoryKinds: computed(() =>
      indexation.value!.entries.reduce<
        Record<string, storyKindSuggestion | undefined>
      >(
        (acc, { id, acceptedSuggestedStoryKind }) => ({
          ...acc,
          [id]: acceptedSuggestedStoryKind,
        }),
        {},
      ),
    ),
  };
});
