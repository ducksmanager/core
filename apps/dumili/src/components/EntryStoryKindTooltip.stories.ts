import type { Meta, StoryObj } from "@storybook/vue3-vite";
import EntryStoryKindTooltip from "./EntryStoryKindTooltip.vue";
import type { FullIndexation } from "~dumili-services/indexation";
import {
  createMockEntry,
  createMockPage,
  createMockImage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

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

export const Default: Story = {
  args: {
    entry: createMockEntry({ id: 1 }),
  },
  decorators: [
    createIndexationDecorator({
      pages: [createMockPage()],
      entries: [createMockEntry({ id: 1 })],
    }),
  ],
  render: (args) => ({
    components: { EntryStoryKindTooltip },
    setup: () => ({ args }),
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
      id: 2,
      storyKindSuggestions: [
        {
          id: 1,
          storyKindRows: {
            id: "1",
            kind: "n" as const,
            numberOfRows: 2,
          },
          storyKindRowsStr: "n1",
          entryId: 2,
          aiKumikoResultId: 1,
        },
      ],
    }),
  },
  decorators: [
    createIndexationDecorator({
      pages: [
        createMockPage({
          id: 1,
          imageId: 1,
          image: createMockImage({
            id: 1,
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
            aiKumikoResultId: 1,
          }) as FullIndexation["pages"][number]["image"],
        }),
      ],
      entries: [createMockEntry({ id: 2 })],
    }),
  ],
  render: (args) => ({
    components: { EntryStoryKindTooltip },
    setup: () => ({ args }),
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
      id: 3,
      position: 1,
      entirepages: 2,
      storyKindSuggestions: [
        {
          id: 1,
          storyKindRows: {
            id: "1",
            kind: "n" as const,
            numberOfRows: 2,
          },
          storyKindRowsStr: "n1",
          entryId: 3,
          aiKumikoResultId: 1,
        },
      ],
    }),
  },
  decorators: [
    createIndexationDecorator({
      pages: [
        createMockPage({
          id: 1,
          pageNumber: 1,
          imageId: 1,
          image: createMockImage({
            id: 1,
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
            aiKumikoResultId: 1,
          }) as FullIndexation["pages"][number]["image"],
        }),
        createMockPage({
          id: 2,
          pageNumber: 2,
          imageId: 2,
          image: createMockImage({
            id: 2,
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
            aiKumikoResultId: 2,
          }),
        }),
      ],
      entries: [createMockEntry({ id: 3, position: 1, entirepages: 2 })],
    }),
  ],
  render: (args) => ({
    components: { EntryStoryKindTooltip },
    setup: () => ({ args }),
    template: `
      <div style="position: relative; width: 300px; height: 200px; padding: 20px;">
        <EntryStoryKindTooltip :entry="args.entry" />
      </div>
    `,
  }),
};
