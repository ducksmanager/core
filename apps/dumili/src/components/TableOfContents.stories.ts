import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TableOfContents from "./TableOfContents.vue";
import {
  createMockEntry,
  createMockPage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

const meta: Meta<typeof TableOfContents> = {
  title: "Components/TableOfContents",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    createIndexationDecorator(
      {
        pages: [
          createMockPage({ id: 1, pageNumber: 1 }),
          createMockPage({ id: 2, pageNumber: 2 }),
          createMockPage({ id: 3, pageNumber: 3 }),
        ],
        entries: [
          createMockEntry({ id: 1, position: 1, entirepages: 1 }),
          createMockEntry({ id: 2, position: 2, entirepages: 1 }),
        ],
      },
      { initializeSocket: true },
    ),
  ],
  render: () => ({
    components: { TableOfContents },
    template: `
      <div style="width: 100%; height: 600px;">
        <TableOfContents />
      </div>
    `,
  }),
};

export const WithMultipleEntries: Story = {
  decorators: [
    createIndexationDecorator(
      {
        pages: Array.from({ length: 10 }, (_, i) =>
          createMockPage({ id: i + 1, pageNumber: i + 1 }),
        ),
        entries: [
          createMockEntry({ id: 1, position: 1, entirepages: 2 }),
          createMockEntry({ id: 2, position: 3, entirepages: 1 }),
          createMockEntry({ id: 3, position: 4, entirepages: 3 }),
          createMockEntry({ id: 4, position: 7, entirepages: 2 }),
        ],
      },
      { initializeSocket: true },
    ),
  ],
  render: () => ({
    components: { TableOfContents },
    template: `
      <div style="width: 100%; height: 600px;">
        <TableOfContents />
      </div>
    `,
  }),
};
