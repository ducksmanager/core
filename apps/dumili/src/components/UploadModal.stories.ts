import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UploadModal from "./UploadModal.vue";
import {
  createMockPage,
  createIndexationDecorator,
} from "../../.storybook/utils/mocks";

const meta: Meta<typeof UploadModal> = {
  title: "Components/UploadModal",
  tags: ["autodocs"],
  argTypes: {
    uploadPageNumber: {
      control: "number",
      description: "The page number to start uploading from",
    },
    pagesWithoutOverwrite: {
      control: "object",
      description: "Pages that should not be overwritten",
    },
    pagesAllowOverwrite: {
      control: "object",
      description: "Pages that can be overwritten",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockPages = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    pageNumber: i + 1,
  }));

export const Default: Story = {
  args: {
    uploadPageNumber: 1,
    pagesWithoutOverwrite: createMockPages(5),
    pagesAllowOverwrite: createMockPages(5),
  },
  decorators: [
    createIndexationDecorator(
      {
        pages: Array.from({ length: 10 }, (_, i) =>
          createMockPage({ id: i + 1, pageNumber: i + 1 }),
        ),
        entries: [],
      },
      { initializeSocket: true },
    ),
  ],
  render: (args) => ({
    components: { UploadModal },
    setup: () => ({ args }),
    template: `
      <div style="width: 100%; height: 500px; position: relative;">
        <UploadModal
          :upload-page-number="args.uploadPageNumber"
          :pages-without-overwrite="args.pagesWithoutOverwrite"
          :pages-allow-overwrite="args.pagesAllowOverwrite"
        />
      </div>
    `,
  }),
};
