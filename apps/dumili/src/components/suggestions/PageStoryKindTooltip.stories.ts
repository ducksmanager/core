import preview from "../../../.storybook/preview";
import PageStoryKindTooltip from "./PageStoryKindTooltip.vue";
import {
  createMockPage,
  createMockEntry,
  createIndexationDecorator,
} from "../../../.storybook/utils/mocks";

const meta = preview.meta({
  title: "Components/suggestions/PageStoryKindTooltip",
  tags: ["autodocs"],
  argTypes: {
    page: {
      control: "object",
      description: "The page object",
    },
  },
});

export const Default = meta.story({
  args: {
    page: {
      id: 1,
      pageNumber: 1,
      indexationId: "mock-indexation-id",
      imageId: null,
      image: null,
    },
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: [createMockPage({ id: 1, pageNumber: 1 })],
        entries: [createMockEntry({ id: 1, position: 1, entirepages: 1 })],
      },
      { initializeSocket: false },
    ),
  ],
  render: (args) => ({
    components: { PageStoryKindTooltip },
    setup: () => ({ args }),
    template: `
      <div style="position: relative; width: 200px; height: 100px; padding: 20px;">
        <PageStoryKindTooltip :page="args.page" />
      </div>
    `,
  }),
});

export const WithDetectedPanels = meta.story({
  args: {
    page: {
      id: 2,
      pageNumber: 2,
      indexationId: "mock-indexation-id",
      imageId: 1,
      image: {
        id: 1,
        url: "https://placehold.co/150",
        aiOcrResult: null,
        aiStorySearchResult: null,
        aiKumikoResultId: 1,
        aiKumikoResult: {
          id: 1,
          inferredStoryKindRowsStr: "n1",
          inferredStoryKindRows: {
            id: "1",
            kind: "n",
            numberOfRows: 2,
          },
          detectedPanels: [
            { id: 1, x: 10, y: 20, width: 100, height: 50, resultId: 1 },
          ],
        },
        aiOcrResultId: null,
        aiStorySearchResultId: null,
      },
    },
  },
  render: (args) => ({
    components: { PageStoryKindTooltip },
    setup: () => ({ args }),
    template: `
      <div style="position: relative; width: 200px; height: 100px; padding: 20px;">
        <PageStoryKindTooltip :page="args.page" />
      </div>
    `,
  }),
});
