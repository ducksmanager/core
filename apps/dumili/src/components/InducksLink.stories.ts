import preview from "../../.storybook/preview";
import InducksLink from "./InducksLink.vue";

const meta = preview.meta({
  title: "Components/InducksLink",
  component: InducksLink,
  tags: ["autodocs"],
  argTypes: {
    storycode: {
      control: "text",
      description: "The Inducks story code",
    },
  },
});

export const Default = meta.story({
  args: {
    storycode: "I+TL+1234-A",
  },
});

export const WithSpecialCharacters = meta.story({
  args: {
    storycode: "I+TL+1234-A%2FB",
  },
});
