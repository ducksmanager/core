import preview from "../../.storybook/preview";
import { ref } from "vue";
import EntryEditModal from "./EntryEditModal.vue";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

const meta = preview.meta({
  title: "Components/EntryEditModal",
  tags: ["autodocs"],
});

const template = `
  <div style="width: 100%; height: 500px; position: relative;">
    <EntryEditModal v-model="entry" v-model:show="show" />
  </div>
`;

export const Default = meta.story({
  decorators: [
    createIndexationDecorator(
      {
        pages: [createMockPage()],
        entries: [createMockEntry()],
      },
      { initializeSocket: true },
    ),
  ],
  render: () => ({
    components: { EntryEditModal },
    setup() {
      const entry = ref(createMockEntry());
      const show = ref(true);
      return { entry, show };
    },
    template,
  }),
});

export const WithStory = meta.story({
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
  render: () => ({
    components: { EntryEditModal },
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
      const show = ref(true);
      return { entry, show };
    },
    template,
  }),
});
