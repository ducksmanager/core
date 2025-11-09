import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import StoryKindSuggestionList from "./StoryKindSuggestionList.vue";
import { suggestions } from "~/stores/suggestions";
import type { FullIndexation, FullEntry } from "~dumili-services/indexation";

const meta: Meta<typeof StoryKindSuggestionList> = {
  title: "Components/suggestions/StoryKindSuggestionList",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockIndexation = (
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

const createMockEntry = (overrides: Partial<FullEntry> = {}): FullEntry => {
  const base: FullEntry = {
    id: 1,
    title: null,
    acceptedStorySuggestionId: null,
    acceptedStoryKindSuggestionId: null,
    indexationId: "mock-indexation-id",
    position: 1,
    entrycomment: null,
    part: null,
    entirepages: 1,
    brokenpagenumerator: 0,
    brokenpagedenominator: 1,
    storyKindSuggestions: [
      {
        id: 1,
        storyKindRows: {
          id: "1",
          kind: "n" as const,
          numberOfRows: 2,
        },
        aiKumikoResultId: null,
        entryId: 1,
        storyKindRowsStr: "n1",
      },
      {
        id: 2,
        storyKindRows: {
          id: "2",
          kind: "c" as const,
          numberOfRows: 1,
        },
        aiKumikoResultId: 1,
        entryId: 1,
        storyKindRowsStr: "c1",
      },
    ],
    acceptedStoryKind: null,
    acceptedStory: null,
    storySuggestions: [],
  };
  return Object.assign(base, overrides);
};

export const Default: Story = {
  args: {
    entry: createMockEntry(),
    editable: true,
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const suggestionsStore = suggestions();
        const indexation = createMockIndexation({
          entries: [
            {
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
            },
          ],
          pages: [
            {
              id: 1,
              pageNumber: 1,
              indexationId: "mock-indexation-id",
              imageId: null,
              image: null,
            },
          ],
        });
        const { indexation: indexationRef } = storeToRefs(suggestionsStore);
        indexationRef.value = indexation;
      },
      template: "<StoryComponent />",
    }),
  ],
  render: (args) => ({
    components: { StoryKindSuggestionList },
    setup() {
      const entry = ref(args.entry);
      return { entry, editable: args.editable };
    },
    template: `
      <div style="width: 300px; height: 200px; position: relative;">
        <StoryKindSuggestionList v-model="entry.acceptedStoryKind" :entry="entry" :editable="editable" />
      </div>
    `,
  }),
};

export const NotEditable: Story = {
  args: {
    entry: createMockEntry({
      acceptedStoryKind: {
        id: 1,
        storyKindRowsStr: "n1",
        entryId: 1,
        storyKindRows: {
          id: "1",
          kind: "n" as const,
          numberOfRows: 2,
        },
        aiKumikoResultId: null,
      },
    }),
    editable: false,
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const suggestionsStore = suggestions();
        const indexation = createMockIndexation({
          entries: [
            {
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
            },
          ],
          pages: [
            {
              id: 1,
              pageNumber: 1,
              indexationId: "mock-indexation-id",
              imageId: null,
              image: null,
            },
          ],
        });
        const { indexation: indexationRef } = storeToRefs(suggestionsStore);
        indexationRef.value = indexation;
      },
      template: "<StoryComponent />",
    }),
  ],
  render: (args) => ({
    components: { StoryKindSuggestionList },
    setup() {
      const entry = ref(args.entry);
      return { entry, editable: args.editable };
    },
    template: `
      <div style="width: 300px; height: 200px; position: relative;">
        <StoryKindSuggestionList v-model="entry.acceptedStoryKind" :entry="entry" :editable="editable" />
      </div>
    `,
  }),
};

export const WithSelected: Story = {
  args: {
    entry: createMockEntry({
      acceptedStoryKind: {
        id: 2,
        storyKindRowsStr: "c1",
        entryId: 1,
        storyKindRows: {
          id: "2",
          kind: "c" as const,
          numberOfRows: 1,
        },
        aiKumikoResultId: 1,
      },
    }),
    editable: true,
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const suggestionsStore = suggestions();
        const indexation = createMockIndexation({
          entries: [
            {
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
            },
          ],
          pages: [
            {
              id: 1,
              pageNumber: 1,
              indexationId: "mock-indexation-id",
              imageId: null,
              image: null,
            },
          ],
        });
        const { indexation: indexationRef } = storeToRefs(suggestionsStore);
        indexationRef.value = indexation;
      },
      template: "<StoryComponent />",
    }),
  ],
  render: (args) => ({
    components: { StoryKindSuggestionList },
    setup() {
      const entry = ref(args.entry);
      return { entry, editable: args.editable };
    },
    template: `
      <div style="width: 300px; height: 200px; position: relative;">
        <StoryKindSuggestionList v-model="entry.acceptedStoryKind" :entry="entry" :editable="editable" />
      </div>
    `,
  }),
};
