import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import StoryKindSuggestionList from "./StoryKindSuggestionList.vue";
import type { FullEntry } from "~dumili-services/indexation";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../../.storybook/utils/mocks";

const meta: Meta<typeof StoryKindSuggestionList> = {
  title: "Components/suggestions/StoryKindSuggestionList",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockEntryWithStoryKinds = (
  overrides: Partial<FullEntry> = {},
): FullEntry => {
  return createMockEntry({
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
    ...overrides,
  });
};

export const Default: Story = {
  args: {
    entry: createMockEntryWithStoryKinds(),
    editable: true,
  },
  decorators: [
    createIndexationDecorator(
      {
        entries: [createMockEntry()],
        pages: [createMockPage()],
      },
      { initializeSocket: true },
    ),
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
    entry: createMockEntryWithStoryKinds({
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
    createIndexationDecorator(
      {
        entries: [createMockEntry()],
        pages: [createMockPage()],
      },
      { initializeSocket: true },
    ),
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
    entry: createMockEntryWithStoryKinds({
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
    createIndexationDecorator(
      {
        entries: [createMockEntry()],
        pages: [createMockPage()],
      },
      { initializeSocket: true },
    ),
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
