import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { storeToRefs } from "pinia";
import EntryStoryKindTooltip from "./EntryStoryKindTooltip.vue";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";

const meta: Meta<typeof EntryStoryKindTooltip> = {
  title: "Components/EntryStoryKindTooltip",
  tags: ["autodocs"],
  argTypes: {
    entry: {
      control: "object",
      description: "The entry object",
    },
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

const createMockEntry = (
  overrides: Partial<FullEntry> = {},
): Partial<FullEntry> => ({
  id: 1,
  storyKindSuggestions: [],
  ...overrides,
});

export const Default: Story = {
  args: {
    entry: createMockEntry(),
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        // Mock the indexation store to provide pages
        const suggestionsStore = suggestions();
        const indexation = createMockIndexation({
          pages: [
            {
              id: 1,
              pageNumber: 1,
              indexationId: "mock-indexation-id",
              imageId: null,
              image: null,
            },
          ],
          entries: [
            {
              id: 1,
              pages: [1],
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
    components: { EntryStoryKindTooltip },
    setup() {
      return { args };
    },
    template: `
      <div style="position: relative; width: 300px; height: 200px; padding: 20px;">
        <EntryStoryKindTooltip :entry="args.entry" />
      </div>
    `,
  }),
};

export const WithImage: Story = {
  args: {
    entry: createMockEntry({
      storyKindSuggestions: [
        {
          id: 1,
          storyKindRows: {
            id: "1",
            kind: "n" as const,
            numberOfRows: 2,
          },
          aiKumikoResultId: 1,
        },
      ],
    }),
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const suggestionsStore = suggestions();
        const indexation = createMockIndexation({
          pages: [
            {
              id: 1,
              pageNumber: 1,
              indexationId: "mock-indexation-id",
              imageId: 1,
              image: {
                id: 1,
                url: "https://via.placeholder.com/150",
                aiKumikoResult: {
                  id: 1,
                  inferredStoryKindRowsStr: "n1",
                  inferredStoryKindRows: {
                    id: "1",
                    kind: "n" as const,
                    numberOfRows: 2,
                  },
                  detectedPanels: [],
                },
                aiOcrResult: null,
                aiStorySearchResult: null,
                aiKumikoResultId: 1,
                aiOcrResultId: null,
                aiStorySearchResultId: null,
              },
            },
          ],
          entries: [
            {
              id: 1,
              pages: [1],
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
    components: { EntryStoryKindTooltip },
    setup() {
      return { args };
    },
    template: `
      <div style="position: relative; width: 300px; height: 200px; padding: 20px;">
        <EntryStoryKindTooltip :entry="args.entry" />
      </div>
    `,
  }),
};

export const WithMultiplePages: Story = {
  args: {
    entry: createMockEntry({
      storyKindSuggestions: [
        {
          id: 1,
          storyKindRows: {
            id: "1",
            kind: "n" as const,
            numberOfRows: 2,
          },
          aiKumikoResultId: 1,
        },
      ],
    }),
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const suggestionsStore = suggestions();
        const indexation = createMockIndexation({
          pages: [
            {
              id: 1,
              pageNumber: 1,
              indexationId: "mock-indexation-id",
              imageId: 1,
              image: {
                id: 1,
                url: "https://via.placeholder.com/150",
                aiKumikoResult: {
                  id: 1,
                  inferredStoryKindRowsStr: "n1",
                  inferredStoryKindRows: {
                    id: "1",
                    kind: "n" as const,
                    numberOfRows: 2,
                  },
                  detectedPanels: [],
                },
                aiOcrResult: null,
                aiStorySearchResult: null,
                aiKumikoResultId: 1,
                aiOcrResultId: null,
                aiStorySearchResultId: null,
              },
            },
            {
              id: 2,
              pageNumber: 2,
              indexationId: "mock-indexation-id",
              imageId: 2,
              image: {
                id: 2,
                url: "https://via.placeholder.com/150",
                aiKumikoResult: {
                  id: 2,
                  inferredStoryKindRowsStr: "c1",
                  inferredStoryKindRows: {
                    id: "2",
                    kind: "c" as const,
                    numberOfRows: 1,
                  },
                  detectedPanels: [],
                },
                aiOcrResult: null,
                aiStorySearchResult: null,
                aiKumikoResultId: 2,
                aiOcrResultId: null,
                aiStorySearchResultId: null,
              },
            },
          ],
          entries: [
            {
              id: 1,
              pages: [1, 2],
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
    components: { EntryStoryKindTooltip },
    setup() {
      return { args };
    },
    template: `
      <div style="position: relative; width: 300px; height: 200px; padding: 20px;">
        <EntryStoryKindTooltip :entry="args.entry" />
      </div>
    `,
  }),
};
