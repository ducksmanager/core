import type { Meta, StoryObj } from "@nuxtjs/storybook";

import GameStartingSoonModal from "./GameStartingSoonModal.vue";

const meta: Meta<typeof GameStartingSoonModal> = {
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
};
