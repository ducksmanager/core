import type { Component } from "vue";
import { storeToRefs } from "pinia";
import { inject } from "vue";
import { suggestions } from "~/stores/suggestions";
import type { FullIndexation, FullEntry } from "~dumili-services/indexation";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

/**
 * Creates a mock indexation with default values
 */
export const createMockIndexation = (
  overrides: Partial<FullIndexation> = {},
): FullIndexation => {
  const base: FullIndexation = {
    id: "mock-indexation-id",
    dmUserId: 1,
    acceptedIssueSuggestionId: null,
    title: null,
    releaseDate: null,
    price: null,
    user: {
      dmId: 1,
      inducksUsername: "mock-user",
    },
    issueSuggestions: [],
    acceptedIssueSuggestion: null,
    pages: [],
    entries: [],
  };
  return Object.assign(base, overrides);
};

/**
 * Creates a mock entry with default values
 */
export const createMockEntry = (
  overrides: Partial<FullEntry> = {},
): FullEntry => {
  const base: FullEntry = {
    id: 1,
    position: 1,
    entirepages: 1,
    title: null,
    acceptedStorySuggestionId: null,
    acceptedStoryKindSuggestionId: null,
    indexationId: "mock-indexation-id",
    entrycomment: null,
    part: null,
    brokenpagenumerator: 0,
    brokenpagedenominator: 1,
    storyKindSuggestions: [],
    acceptedStoryKind: null,
    acceptedStory: null,
    storySuggestions: [],
  };
  return Object.assign(base, overrides);
};

/**
 * Creates a mock page with default values
 */
export const createMockPage = (
  overrides: Partial<FullIndexation["pages"][number]> = {},
): FullIndexation["pages"][number] => ({
  id: 1,
  pageNumber: 1,
  indexationId: "mock-indexation-id",
  imageId: null,
  image: null,
  ...overrides,
});

/**
 * Creates a mock image with AI results
 */
export const createMockImage = (
  overrides: Partial<
    NonNullable<FullIndexation["pages"][number]["image"]>
  > = {},
): NonNullable<FullIndexation["pages"][number]["image"]> => {
  const base: NonNullable<FullIndexation["pages"][number]["image"]> = {
    id: 1,
    url: "https://placehold.co/150",
    aiKumikoResult: null,
    aiOcrResult: null,
    aiStorySearchResult: null,
    aiKumikoResultId: null,
    aiOcrResultId: null,
    aiStorySearchResultId: null,
  };
  return Object.assign(base, overrides);
};

/**
 * Sets up the indexation store with a mock indexation
 */
export const setupIndexationStore = (
  indexationOverrides: Partial<FullIndexation> = {},
) => {
  const suggestionsStore = suggestions();
  const indexation = createMockIndexation(indexationOverrides);
  const { indexation: indexationRef } = storeToRefs(suggestionsStore);
  indexationRef.value = indexation;
  return indexation;
};

/**
 * Creates a decorator that sets up the indexation store and optionally initializes the socket
 */
export const createIndexationDecorator =
  (
    indexationOverrides: Partial<FullIndexation> = {},
    options: { initializeSocket?: boolean } = {},
  ) =>
  (story: () => Component) => ({
    components: { StoryComponent: story() },
    setup() {
      const indexation = setupIndexationStore(indexationOverrides);
      if (options.initializeSocket) {
        const { setIndexationSocketFromId } = inject(dumiliSocketInjectionKey)!;
        setIndexationSocketFromId(indexation.id);
      }
    },
    template: "<StoryComponent />",
  });
