import preview from "../../.storybook/preview";
import { ref } from "vue";
import TableOfContentsEntry from "./TableOfContentsEntry.vue";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

const meta = preview.meta({
  title: "Components/TableOfContentsEntry",
  tags: ["autodocs"],
  argTypes: {
    entry: {
      control: "object",
      description: "The entry object",
    },
  },
});

export const Default = meta.story({
  args: {
    entry: createMockEntry(),
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
    components: { TableOfContentsEntry },
    setup() {
      const entry = ref(args.entry);
      return { entry };
    },
    template: `
      <div style="width: 100%; height: 50px; position: relative;">
        <TableOfContentsEntry v-model="entry" />
      </div>
    `,
  }),
});

export const WithStoryKind = meta.story({
  args: {
    entry: createMockEntry({
      acceptedStoryKind: {
        id: 1,
        storyKindRowsStr: "n1",
        entryId: 1,
        aiKumikoResultId: null,
        storyKindRows: {
          id: "1",
          kind: "n" as const,
          numberOfRows: 2,
        },
      },
    }),
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [createMockPage()],
        entries: [
          createMockEntry({
            acceptedStoryKind: {
              id: 1,
              storyKindRowsStr: "n1",
              entryId: 1,
              aiKumikoResultId: null,
              storyKindRows: {
                id: "1",
                kind: "n" as const,
                numberOfRows: 2,
              },
            },
          }),
        ],
      },
      { initializeSocket: true },
    ),
  ],
  render: (args) => ({
    components: { TableOfContentsEntry },
    setup() {
      const entry = ref(args.entry);
      return { entry };
    },
    template: `
      <div style="width: 100%; height: 50px; position: relative;">
        <TableOfContentsEntry v-model="entry" />
      </div>
    `,
  }),
});

export const MultiplePages = meta.story({
  args: {
    entry: createMockEntry({
      position: 1,
      entirepages: 3,
    }),
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [
          createMockPage({ id: 1, pageNumber: 1 }),
          createMockPage({ id: 2, pageNumber: 2 }),
          createMockPage({ id: 3, pageNumber: 3 }),
        ],
        entries: [createMockEntry({ position: 1, entirepages: 3 })],
      },
      { initializeSocket: true },
    ),
  ],
  render: (args) => ({
    components: { TableOfContentsEntry },
    setup() {
      const entry = ref(args.entry);
      return { entry };
    },
    template: `
      <div style="width: 100%; height: 150px; position: relative;">
        <TableOfContentsEntry v-model="entry" />
      </div>
    `,
  }),
});
