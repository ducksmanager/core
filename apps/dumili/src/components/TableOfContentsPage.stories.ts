import preview from "../../.storybook/preview";
import TableOfContentsPage from "./TableOfContentsPage.vue";
import { ui } from "~/stores/ui";

const meta = preview.meta({
  title: "Components/TableOfContentsPage",
  component: TableOfContentsPage,
  tags: ["autodocs"],

  argTypes: {
    page: {
      control: "object",
      description: "The page object with id and pageNumber",
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
  render: (args) => ({
    components: { TableOfContentsPage },
    setup: () => ({ args }),
    template: `
      <div style="height: 50px;">
        <TableOfContentsPage :page="args.page" />
      </div>
    `,
  }),
});

export const Page5 = meta.story({
  args: {
    page: {
      id: 5,
      pageNumber: 5,
      indexationId: "mock-indexation-id",
      imageId: null,
      image: null,
    },
  },
  render: (args) => ({
    components: { TableOfContentsPage },
    setup: () => ({ args }),
    template: `
      <div style="height: 50px;">
        <TableOfContentsPage :page="args.page" />
      </div>
    `,
  }),
});

export const Visible = meta.story({
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
  render: (args) => ({
    components: { TableOfContentsPage },
    setup: () => ({ args }),
    template: `
      <div style="height: 50px;">
        <TableOfContentsPage :page="args.page" />
      </div>
    `,
  }),
});
