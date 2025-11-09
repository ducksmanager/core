import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { type Component } from "vue";
import { storeToRefs } from "pinia";
import StorySuggestionsTooltip from "./StorySuggestionsTooltip.vue";
import { suggestions } from "~/stores/suggestions";
import type { FullEntry, FullIndexation } from "~dumili-services/indexation";

const meta: Meta<typeof StorySuggestionsTooltip> = {
  title: "Components/suggestions/StorySuggestionsTooltip",
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

type TooltipEntry = InstanceType<
  typeof StorySuggestionsTooltip
>["$props"]["entry"];

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
  overrides: Partial<TooltipEntry> = {},
): TooltipEntry => {
  const base: TooltipEntry = {
    id: 1,
    storySuggestions: [
      {
        id: 1,
        storycode: "I TL  116-AP",
        aiStorySuggestionId: null,
        entryId: 1,
        aiStorySuggestion: null,
      },
    ],
    acceptedStoryKind: null,
  };
  return Object.assign(base, overrides);
};

const createMockIndexationEntry = (
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

const createRenderFunction = () => (args: { entry: TooltipEntry }) => ({
  components: { StorySuggestionsTooltip },
  setup() {
    return { args };
  },
  template: `
    <div style="position: relative; width: 300px; height: 200px; padding: 20px;">
      <StorySuggestionsTooltip :entry="args.entry" />
    </div>
  `,
});

export const Default: Story = {
  args: {
    entry: createMockEntry(),
  },
  decorators: [createDecorator()],
  render: createRenderFunction(),
};

export const WithStoryKind: Story = {
  args: {
    entry: createMockEntry({
      acceptedStoryKind: {
        id: 1,
        storyKindRowsStr: "n1",
        entryId: 1,
        aiKumikoResultId: 1,
        storyKindRows: {
          id: "1",
          kind: "n" as const,
          numberOfRows: 2,
        },
      },
    }),
  },
  decorators: [createDecorator()],
  render: createRenderFunction(),
};

export const WithImageAndOcrResult: Story = {
  args: {
    entry: createMockEntry({
      acceptedStoryKind: {
        id: 1,
        storyKindRowsStr: "n1",
        entryId: 1,
        aiKumikoResultId: 1,
        storyKindRows: {
          id: "1",
          kind: "n" as const,
          numberOfRows: 2,
        },
      },
    }),
  },
  decorators: [
    createDecorator({
      pages: [
        createMockPage({
          imageId: 1,
          image: {
            id: 1,
            url: "https://via.placeholder.com/150",
            aiOcrResult: {
              id: 1,
              matches: [
                {
                  id: 1,
                  resultId: 1,
                  text: "Sample text",
                  x1: 10,
                  y1: 20,
                  x2: 100,
                  y2: 50,
                  confidence: 0.95,
                },
              ],
              stories: [],
            },
            aiStorySearchResult: null,
            aiKumikoResult: null,
            aiKumikoResultId: null,
            aiOcrResultId: 1,
            aiStorySearchResultId: null,
          },
        }),
      ],
    }),
  ],
  render: createRenderFunction(),
};
