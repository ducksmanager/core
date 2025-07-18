import type { Meta, StoryObj } from "@storybook/vue3-vite";

import AuthorCard from "~/components/AuthorCard.vue";

const meta: Meta<typeof AuthorCard> = {
  title: "AuthorCard",
  component: AuthorCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    enabled: {
      control: "boolean",
    },
    selectable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    enabled: true,
    selectable: true,
    author: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
  },
};

export const NotEnabled: Story = {
  args: {
    enabled: false,
    selectable: false,
    author: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
  },
};

export const NotSelectable: Story = {
  args: {
    enabled: true,
    selectable: false,
    author: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
  },
};
