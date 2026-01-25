import preview from "../../.storybook/preview";
import type { Meta, StoryObj } from "@nuxtjs/storybook";

import AuthorCard from "./AuthorCard.vue";

const meta = preview.meta({
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
});

export const Default = meta.story({
  args: {
    enabled: true,
    selectable: true,
    author: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
  },
});

export const NotEnabled = meta.story({
  args: {
    enabled: false,
    selectable: false,
    author: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
  },
});

export const NotSelectable = meta.story({
  args: {
    enabled: true,
    selectable: false,
    author: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
  },
});
