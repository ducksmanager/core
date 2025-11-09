import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TableOfContentsPage from "./TableOfContentsPage.vue";
import { ui } from "~/stores/ui";

const meta: Meta<typeof TableOfContentsPage> = {
  title: "Components/TableOfContentsPage",
  component: TableOfContentsPage,
  tags: ["autodocs"],
  argTypes: {
    page: {
      control: "object",
      description: "The page object with id and pageNumber",
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
};

export const Page5: Story = {
  args: {
    page: {
      id: 5,
      pageNumber: 5,
      indexationId: "mock-indexation-id",
      imageId: null,
      image: null,
    },
  },
};

export const Visible: Story = {
  args: {
    page: {
      id: 3,
      pageNumber: 3,
      indexationId: "mock-indexation-id",
      imageId: null,
      image: null,
    },
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const uiStore = ui();
        uiStore.visiblePages = new Set([3]);
      },
      template: "<StoryComponent />",
    }),
  ],
};
