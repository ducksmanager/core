import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Publication from "./Publication.vue";

const meta: Meta<typeof Publication> = {
  title: "Components/Publication",
  component: Publication,
  tags: ["autodocs"],
  argTypes: {
    publicationcode: {
      control: "text",
      description: "The publication code (e.g., 'us/DD' or 'fr/PM')",
    },
    publicationname: {
      control: "text",
      description: "The display name of the publication",
    },
    displayClass: {
      control: "select",
      options: ["d-inline-flex", "d-flex", "d-block"],
      description: "The CSS display class",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    publicationcode: "us/DD",
    publicationname: "Donald Duck",
    displayClass: "d-inline-flex",
  },
};

export const Large: Story = {
  args: {
    publicationcode: "fr/PM",
    publicationname: "Picsou Magazine",
    displayClass: "d-inline-flex",
  },
};

export const Small: Story = {
  args: {
    publicationcode: "dk/AND",
    publicationname: "Anders And & Co.",
    displayClass: "d-inline-flex",
  },
};

export const WithSlot: Story = {
  args: {
    publicationcode: "us/DD",
    publicationname: "Donald Duck",
    displayClass: "d-inline-flex",
  },
  render: (args) => ({
    components: { Publication },
    setup() {
      return { args };
    },
    template: `
      <Publication v-bind="args">
        <span class="ms-2 text-muted">(1934-)</span>
      </Publication>
    `,
  }),
};
