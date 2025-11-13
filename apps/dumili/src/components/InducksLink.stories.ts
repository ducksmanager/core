import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InducksLink from "./InducksLink.vue";

const meta: Meta<typeof InducksLink> = {
  title: "Components/InducksLink",
  component: InducksLink,
  tags: ["autodocs"],
  argTypes: {
    urlEncodedStorycode: {
      control: "text",
      description: "The URL-encoded story code for Inducks",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    urlEncodedStorycode: "I+TL+1234-A",
  },
};

export const WithSpecialCharacters: Story = {
  args: {
    urlEncodedStorycode: "I+TL+1234-A%2FB",
  },
};
