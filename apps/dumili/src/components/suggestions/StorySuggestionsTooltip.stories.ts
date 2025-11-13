import type { Meta, StoryObj } from "@storybook/vue3-vite";
import StorySuggestionsTooltip from "./StorySuggestionsTooltip.vue";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../../.storybook/utils/mocks";

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

const createMockTooltipEntry = (
  overrides: Partial<TooltipEntry> = {},
): TooltipEntry =>
  createMockEntry({
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
    ...overrides,
  }) as TooltipEntry;

const createDecorator = (indexationOverrides = {}) =>
  createIndexationDecorator(
    {
      pages: [createMockPage()],
      entries: [createMockEntry()],
      ...indexationOverrides,
    },
    { initializeSocket: false },
  );

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
    entry: createMockTooltipEntry(),
  },
  decorators: [createDecorator()],
  render: createRenderFunction(),
};

export const WithStoryKind: Story = {
  args: {
    entry: createMockTooltipEntry({
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
    entry: createMockTooltipEntry({
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
            url: "https://placehold.co/150",
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
