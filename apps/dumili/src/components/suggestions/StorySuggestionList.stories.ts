import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import StorySuggestionList from "./StorySuggestionList.vue";
import type { FullEntry } from "~dumili-services/indexation";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../../.storybook/utils/mocks";

const meta: Meta<typeof StorySuggestionList> = {
  title: "Components/suggestions/StorySuggestionList",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockEntryWithStories = (
  overrides: Partial<FullEntry> = {},
): FullEntry => {
  return createMockEntry({
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
    ...overrides,
  });
};

const createDecorator = (indexationOverrides = {}) =>
  createIndexationDecorator(
    {
      pages: [createMockPage()],
      entries: [createMockEntry()],
      ...indexationOverrides,
    },
    { initializeSocket: false },
  );

export const Default: Story = {
  args: {
    modelValue: createMockEntryWithStories(),
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
    modelValue: createMockEntryWithStories({
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
