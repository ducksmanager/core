import preview from "../../.storybook/preview";
import type { StoryObj } from "@storybook/vue3-vite";
import StoryKindBadge from "./StoryKindBadge.vue";

const meta = preview.meta({
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
});

type Story = StoryObj<typeof meta>;

export const Story = meta.story({
  args: {
    kind: "n",
  },
});

export const NewspaperStrip = meta.story({
  args: {
    kind: "k",
  },
});

export const Cover = meta.story({
  args: {
    kind: "c",
  },
});

export const Illustration = meta.story({
  args: {
    kind: "i",
  },
});

export const GameOrPuzzle = meta.story({
  args: {
    kind: "g",
  },
});

export const TextStory = meta.story({
  args: {
    kind: "t",
  },
});

export const Article = meta.story({
  args: {
    kind: "a",
  },
});

export const Unknown = meta.story({
  args: {
    kind: undefined,
  },
});
