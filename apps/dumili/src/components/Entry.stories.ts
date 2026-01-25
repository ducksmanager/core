import preview from "../../.storybook/preview";
import { ref } from "vue";
import Entry from "./Entry.vue";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

const meta = preview.meta({
  title: "Components/Entry",
  tags: ["autodocs"],
  argTypes: {
    editable: {
      control: "boolean",
      description: "Whether the entry is editable",
    },
  },
});

const template = `
  <div style="width: 100%; height: 100px;">
    <Entry v-model="entry" :editable="editable" />
  </div>
`;

export const Default = meta.story({
  args: {
    editable: true,
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [createMockPage()],
        entries: [createMockEntry()],
      },
      { initializeSocket: true },
    ),
  ],
  render: (args) => ({
    components: { Entry },
    setup() {
      const entry = ref(createMockEntry());
      return { entry, editable: args.editable };
    },
    template,
  }),
});

export const NotEditable = meta.story({
  args: {
    editable: false,
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [createMockPage()],
        entries: [createMockEntry()],
      },
      { initializeSocket: true },
    ),
  ],
  render: (args) => ({
    components: { Entry },
    setup() {
      const entry = ref(createMockEntry());
      return { entry, editable: args.editable };
    },
    template,
  }),
});

export const WithStory = meta.story({
  args: {
    editable: true,
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [createMockPage()],
        entries: [
          createMockEntry({
            acceptedStory: {
              id: 1,
              storycode: "I TL  116-AP",
              aiStorySuggestionId: null,
              entryId: 1,
            },
          }),
        ],
      },
      { initializeSocket: true },
    ),
  ],
  render: (args) => ({
    components: { Entry },
    setup() {
      const entry = ref(
        createMockEntry({
          acceptedStory: {
            id: 1,
            storycode: "I TL  116-AP",
            aiStorySuggestionId: null,
            entryId: 1,
          },
        }),
      );
      return { entry, editable: args.editable };
    },
    template,
  }),
});
