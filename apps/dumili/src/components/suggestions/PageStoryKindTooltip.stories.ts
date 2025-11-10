import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PageStoryKindTooltip from "./PageStoryKindTooltip.vue";

const meta: Meta<typeof PageStoryKindTooltip> = {
  title: "Components/suggestions/PageStoryKindTooltip",
  tags: ["autodocs"],
  argTypes: {
    page: {
      control: "object",
      description: "The page object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    page: {
      id: 1,
      pageNumber: 1,
      indexationId: "mock-indexation-id",
      imageId: null,
      image: null,
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
};

export const WithDetectedPanels: Story = {
  args: {
    page: {
      id: 2,
      pageNumber: 2,
      indexationId: "mock-indexation-id",
      imageId: 1,
      image: {
        id: 1,
        url: "https://via.placeholder.com/150",
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
};
