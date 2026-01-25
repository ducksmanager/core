import preview from "../../.storybook/preview";
import InducksLink from "./InducksLink.vue";

const meta = preview.meta({
  title: "Components/InducksLink",
  component: InducksLink,
  tags: ["autodocs"],
  argTypes: {
    urlEncodedStorycode: {
      control: "text",
      description: "The URL-encoded story code for Inducks",
    },
  },
});

export const Default = meta.story({
  args: {
    urlEncodedStorycode: "I+TL+1234-A",
  },
});

export const WithSpecialCharacters = meta.story({
  args: {
    urlEncodedStorycode: "I+TL+1234-A%2FB",
  },
});
