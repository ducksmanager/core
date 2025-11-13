import type { Meta, StoryObj } from "@storybook/vue3-vite";
import StoryKindBadge from "./StoryKindBadge.vue";

const meta: Meta<typeof StoryKindBadge> = {
  title: "Components/StoryKindBadge",
  component: StoryKindBadge,
  tags: ["autodocs"],
  argTypes: {
    kind: {
      control: "select",
      options: ["n", "k", "c", "i", "g", "t", "a", "P", "L", "f"],
      description: "The story kind identifier",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Story: Story = {
  args: {
    kind: "n",
  },
};

export const NewspaperStrip: Story = {
  args: {
    kind: "k",
  },
};

export const Cover: Story = {
  args: {
    kind: "c",
  },
};

export const Illustration: Story = {
  args: {
    kind: "i",
  },
};

export const GameOrPuzzle: Story = {
  args: {
    kind: "g",
  },
};

export const TextStory: Story = {
  args: {
    kind: "t",
  },
};

export const Article: Story = {
  args: {
    kind: "a",
  },
};

export const Unknown: Story = {
  args: {
    kind: undefined,
  },
};
