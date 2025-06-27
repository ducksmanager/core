import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DefaultLayout from "~/layouts/default.vue";

const meta: Meta<typeof DefaultLayout> = {
  title: "DefaultLayout",
  component: DefaultLayout,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
