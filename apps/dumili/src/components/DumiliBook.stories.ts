import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { storeToRefs } from "pinia";
import DumiliBook from "./DumiliBook.vue";
import {
  createMockIndexation,
  createMockPage,
  createMockImage,
  createMockEntry,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";
import type { FullIndexation } from "~dumili-services/indexation";
import { ui } from "~/stores/ui";

const meta: Meta<typeof DumiliBook> = {
  title: "Components/DumiliBook",
  tags: ["autodocs"],
  argTypes: {
    indexation: {
      control: "object",
      description: "The indexation object",
    },
    firstPageDimensions: {
      control: "object",
      description: "Dimensions of the first page",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    indexation: createMockIndexation({
      pages: [
        createMockPage({
          id: 1,
          pageNumber: 1,
          imageId: 1,
          image: createMockImage({
            id: 1,
            url: "https://via.placeholder.com/300x400?text=Page+1",
          }) as FullIndexation["pages"][number]["image"],
        }),
        createMockPage({
          id: 2,
          pageNumber: 2,
          imageId: 2,
          image: createMockImage({
            id: 2,
            url: "https://via.placeholder.com/300x400?text=Page+2",
          }) as FullIndexation["pages"][number]["image"],
        }),
      ],
    }),
    firstPageDimensions: {
      width: 300,
      height: 400,
    },
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [
          createMockPage({
            id: 1,
            pageNumber: 1,
            imageId: 1,
            image: createMockImage({
              id: 1,
              url: "https://via.placeholder.com/300x400?text=Page+1",
            }) as FullIndexation["pages"][number]["image"],
          }),
          createMockPage({
            id: 2,
            pageNumber: 2,
            imageId: 2,
            image: createMockImage({
              id: 2,
              url: "https://via.placeholder.com/300x400?text=Page+2",
            }) as FullIndexation["pages"][number]["image"],
          }),
        ],
        entries: [
          createMockEntry({
            id: 1,
            position: 1,
            entirepages: 1,
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
      { initializeSocket: false },
    ),
  ],
  render: (args) => ({
    components: { DumiliBook },
    setup: () => ({ args }),
    template: `
      <div style="width: 100%; height: 500px;">
        <DumiliBook
          :indexation="args.indexation"
          :first-page-dimensions="args.firstPageDimensions"
        />
      </div>
    `,
  }),
};

export const WithOverlay: Story = {
  args: {
    indexation: createMockIndexation({
      pages: [
        createMockPage({
          id: 1,
          pageNumber: 1,
          imageId: 1,
          image: createMockImage({
            id: 1,
            url: "https://via.placeholder.com/300x400?text=Page+1",
          }) as FullIndexation["pages"][number]["image"],
        }),
        createMockPage({
          id: 2,
          pageNumber: 2,
          imageId: 2,
          image: createMockImage({
            id: 2,
            url: "https://via.placeholder.com/300x400?text=Page+2",
          }) as FullIndexation["pages"][number]["image"],
        }),
      ],
    }),
    firstPageDimensions: {
      width: 300,
      height: 400,
    },
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [
          createMockPage({
            id: 1,
            pageNumber: 1,
            imageId: 1,
            image: createMockImage({
              id: 1,
              url: "https://via.placeholder.com/300x400?text=Page+1",
            }) as FullIndexation["pages"][number]["image"],
          }),
          createMockPage({
            id: 2,
            pageNumber: 2,
            imageId: 2,
            image: createMockImage({
              id: 2,
              url: "https://via.placeholder.com/300x400?text=Page+2",
            }) as FullIndexation["pages"][number]["image"],
          }),
        ],
        entries: [
          createMockEntry({
            id: 1,
            position: 1,
            entirepages: 1,
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
      { initializeSocket: false },
    ),
  ],
  render: (args) => ({
    components: { DumiliBook },
    setup() {
      const { overlay } = storeToRefs(ui());
      overlay.value = {
        type: "story kind",
        entryId: 1,
      };
      return { args };
    },
    template: `
      <div style="width: 100%; height: 500px;">
        <DumiliBook
          :indexation="args.indexation"
          :first-page-dimensions="args.firstPageDimensions"
        />
      </div>
    `,
  }),
};
