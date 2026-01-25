import preview from "../../.storybook/preview";
import Gallery from "./Gallery.vue";
import { createMockPage, createMockImage } from "../../.storybook/utils/mocks";

const meta = preview.meta({
  title: "Components/Gallery",
  tags: ["autodocs"],
  argTypes: {
    selectable: {
      control: "boolean",
      description: "Whether pages are selectable",
    },
  },
});

const createMockPages = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockPage({
      id: i + 1,
      pageNumber: i + 1,
      imageId: i % 2 === 0 ? i + 1 : null,
      image:
        i % 2 === 0
          ? createMockImage({
              id: i + 1,
              url: `https://placehold.co/150?text=Page+${i + 1}`,
            })
          : null,
    }),
  );

export const Default = meta.story({
  args: {
    pages: createMockPages(6),
    selectable: false,
  },
  render: (args) => ({
    components: { Gallery },
    setup: () => ({ args }),
    template: `
      <div style="width: 100%; height: 400px;">
        <Gallery :pages="args.pages" :selectable="args.selectable" />
      </div>
    `,
  }),
});

export const Selectable = meta.story({
  args: {
    pages: createMockPages(6),
    selectable: true,
  },
  render: (args) => ({
    components: { Gallery },
    setup: () => ({ args }),
    template: `
      <div style="width: 100%; height: 400px;">
        <Gallery :pages="args.pages" :selectable="args.selectable" />
      </div>
    `,
  }),
});

export const WithAllImages = meta.story({
  args: {
    pages: Array.from({ length: 4 }, (_, i) =>
      createMockPage({
        id: i + 1,
        pageNumber: i + 1,
        imageId: i + 1,
        image: createMockImage({
          id: i + 1,
          url: `https://placehold.co/150?text=Page+${i + 1}`,
        }),
      }),
    ),
    selectable: false,
  },
  render: (args) => ({
    components: { Gallery },
    setup: () => ({ args }),
    template: `
      <div style="width: 100%; height: 400px;" class="container-fluid d-flex flex-column align-items-center justify-content-center flex-grow-1 overflow-y-auto">
        <Gallery :pages="args.pages" :selectable="args.selectable" />
      </div>
    `,
  }),
});
