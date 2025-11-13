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

// Shared constants
const FIRST_PAGE_DIMENSIONS = {
  width: 300,
  height: 400,
};

const MOCK_ENTRY = createMockEntry({
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
});

const DETECTED_PANELS = [
  {
    id: 1,
    x: 20,
    y: 30,
    width: 120,
    height: 150,
    resultId: 1,
  },
  {
    id: 2,
    x: 160,
    y: 30,
    width: 120,
    height: 150,
    resultId: 1,
  },
  {
    id: 3,
    x: 20,
    y: 200,
    width: 260,
    height: 180,
    resultId: 1,
  },
];

// Helper functions
const createBasicPages = () => [
  createMockPage({
    id: 1,
    pageNumber: 1,
    imageId: 1,
    image: createMockImage({
      id: 1,
      url: "https://placehold.co/300x400?text=Page+1",
    }) as FullIndexation["pages"][number]["image"],
  }),
  createMockPage({
    id: 2,
    pageNumber: 2,
    imageId: 2,
    image: createMockImage({
      id: 2,
      url: "https://placehold.co/300x400?text=Page+2",
    }) as FullIndexation["pages"][number]["image"],
  }),
];

const createPageWithPanels = () =>
  createMockPage({
    id: 1,
    pageNumber: 1,
    imageId: 1,
    image: createMockImage({
      id: 1,
      url: "https://placehold.co/300x400?text=Page+1",
      aiKumikoResultId: 1,
      aiKumikoResult: {
        id: 1,
        inferredStoryKindRowsStr: "n1",
        inferredStoryKindRows: {
          id: "1",
          kind: "n" as const,
          numberOfRows: 2,
        },
        detectedPanels: DETECTED_PANELS,
      },
    }) as FullIndexation["pages"][number]["image"],
  });

type StoryArgs = {
  indexation: FullIndexation;
  firstPageDimensions: { width: number; height: number };
};

const createDefaultRender = () => (args: StoryArgs) => ({
  components: { DumiliBook },
  setup: () => ({ args }),
  template: `
    <div style="width: 100%; height: 500px;" class="d-flex">
      <DumiliBook
        :indexation="args.indexation"
        :first-page-dimensions="args.firstPageDimensions"
      />
    </div>
  `,
});

const createBasicIndexationOverrides = () => ({
  pages: createBasicPages(),
  entries: [MOCK_ENTRY],
});

export const Default: Story = {
  args: {
    indexation: createMockIndexation(createBasicIndexationOverrides()),
    firstPageDimensions: FIRST_PAGE_DIMENSIONS,
  },
  decorators: [
    createIndexationDecorator(createBasicIndexationOverrides(), {
      initializeSocket: false,
    }),
  ],
  render: createDefaultRender(),
};

const createIndexationWithPanels = () => ({
  pages: [
    createPageWithPanels(),
    createMockPage({
      id: 2,
      pageNumber: 2,
      imageId: 2,
      image: createMockImage({
        id: 2,
        url: "https://placehold.co/300x400?text=Page+2",
      }) as FullIndexation["pages"][number]["image"],
    }),
  ],
  entries: [MOCK_ENTRY],
});

export const WithPanelsOverlay: Story = {
  args: {
    indexation: createMockIndexation(createIndexationWithPanels()),
    firstPageDimensions: FIRST_PAGE_DIMENSIONS,
  },
  decorators: [
    createIndexationDecorator(createIndexationWithPanels(), {
      initializeSocket: false,
    }),
  ],
  render: (args) => ({
    components: { DumiliBook },
    setup() {
      const { overlay, visiblePages } = storeToRefs(ui());
      overlay.value = {
        type: "panels",
        pageId: 1,
        entryId: 1,
      };
      visiblePages.value = new Set([1]);
      return { args };
    },
    template: `
      <div style="width: 100%; height: 500px;" class="d-flex">
        <DumiliBook
          :indexation="args.indexation"
          :first-page-dimensions="args.firstPageDimensions"
        />
      </div>
    `,
  }),
};
