import preview from "../../.storybook/preview";
import type { Meta, StoryObj } from "@nuxtjs/storybook";

import GameStartingSoonModal from "./GameStartingSoonModal.vue";

const meta = preview.meta({
  title: "GameStartingSoonModal",
  component: GameStartingSoonModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    firstRoundStartDate: {
      control: "date",
    },
  },
});

export const Default = meta.story({
  args: {
    authors: [
      {
        personcode: "CB",
        nationalitycountrycode: "us",
        fullname: "Carl Barks",
      },
      {
        personcode: "DR",
        nationalitycountrycode: "us",
        fullname: "Don Rosa",
      },
      {
        personcode: "RSc",
        nationalitycountrycode: "us",
        fullname: "Romano Scarpa",
      },
      {
        personcode: "CB",
        nationalitycountrycode: "us",
        fullname: "Carl Barks",
      },
      {
        personcode: "DR",
        nationalitycountrycode: "us",
        fullname: "Don Rosa",
      },
      {
        personcode: "RSc",
        nationalitycountrycode: "us",
        fullname: "Romano Scarpa",
      },
      {
        personcode: "CB",
        nationalitycountrycode: "us",
        fullname: "Carl Barks",
      },
      {
        personcode: "DR",
        nationalitycountrycode: "us",
        fullname: "Don Rosa",
      },
      {
        personcode: "RSc",
        nationalitycountrycode: "us",
        fullname: "Romano Scarpa",
      },
    ],
    firstRoundStartDate: (() => {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 20);
      return futureDate;
    })(),
  },
});
