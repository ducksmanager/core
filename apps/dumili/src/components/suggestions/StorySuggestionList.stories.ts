import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, type Component } from "vue";
import { storeToRefs } from "pinia";
import StorySuggestionList from "./StorySuggestionList.vue";
import { suggestions } from "~/stores/suggestions";
import type { FullIndexation, FullEntry } from "~dumili-services/indexation";

const meta: Meta<typeof StorySuggestionList> = {
  title: "Components/suggestions/StorySuggestionList",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function createMockIndexation(
  overrides: Partial<FullIndexation> = {},
): FullIndexation {
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
}

function createMockEntry(overrides: Partial<FullEntry> = {}): FullEntry {
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
    storySuggestions: [
      {
        id: 1,
        storycode: "I TL  116-AP",
        aiStorySuggestionId: null,
        entryId: 1,
        aiStorySuggestion: null,
      },
      {
        id: 2,
        storycode: "I TL 5678-B",
        aiStorySuggestionId: 1,
        entryId: 1,
        aiStorySuggestion: {
          id: 1,
          ocrPossibleStoryId: null,
          storySearchPossibleStoryId: 1,
        },
      },
    ],
  };
  return Object.assign(base, overrides);
}

function createMockIndexationEntry(
  overrides: Partial<FullEntry> = {},
): FullEntry {
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
}

const createMockPage = (
  overrides: Partial<FullIndexation["pages"][number]> = {},
) => ({
  id: 1,
  pageNumber: 1,
  indexationId: "mock-indexation-id",
  imageId: null,
  image: null,
  ...overrides,
});

const setupIndexationStore = (
  indexationOverrides: Partial<FullIndexation> = {},
) => {
  const suggestionsStore = suggestions();
  const indexation = createMockIndexation({
    pages: [createMockPage()],
    entries: [createMockIndexationEntry()],
    ...indexationOverrides,
  });
  const { indexation: indexationRef } = storeToRefs(suggestionsStore);
  indexationRef.value = indexation;
};

const createDecorator =
  (indexationOverrides: Partial<FullIndexation> = {}) =>
  (story: () => Component) => ({
    components: { StoryComponent: story() },
    setup() {
      setupIndexationStore(indexationOverrides);
    },
    template: "<StoryComponent />",
  });

export const Default: Story = {
  args: {
    modelValue: createMockEntry(),
  },
  decorators: [createDecorator()],
  render: (args) => ({
    components: { StorySuggestionList },
    setup() {
      const entry = ref(args.modelValue);
      return { entry };
    },
    template: `
      <div style="width: 400px; height: 200px" class="position-relative m-auto d-flex flex-column justify-content-center">
        <StorySuggestionList v-model="entry" />
      </div>
    `,
  }),
};

export const WithSelected: Story = {
  args: {
    modelValue: createMockEntry({
      acceptedStory: {
        id: 1,
        storycode: "I TL  116-AP",
        aiStorySuggestionId: null,
        entryId: 1,
      },
    }),
  },
  decorators: [createDecorator()],
  render: (args) => ({
    components: { StorySuggestionList },
    setup() {
      const entry = ref(args.modelValue);
      return { entry };
    },
    template: `
      <div style="width: 400px; height: 200px" class="position-relative m-auto d-flex flex-column justify-content-center">
        <StorySuggestionList v-model="entry" />
      </div>
    `,
  }),
};
