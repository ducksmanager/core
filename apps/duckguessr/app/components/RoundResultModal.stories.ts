import type { Meta, StoryObj } from "@storybook/vue3-vite";

import RoundResultModal from "~/components/RoundResultModal.vue";

const meta: Meta<typeof RoundResultModal> = {
  title: "RoundResultModal",
  component: RoundResultModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["success", "danger"],
    },
    roundNumber: {
      control: "number",
    },
    speedBonus: {
      control: "number",
    },
    hasEverybodyGuessed: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "success",
    roundNumber: 1,
    speedBonus: 65,
    roundUrl: "thumbnails3/webusers/2014/04/hu_mm1992_07e_001.jpg",
    correctAuthor: {
      personcode: "DR",
      fullname: "Don Rosa",
      nationalitycountrycode: "us",
    },
    nextRoundStartDate: (() => {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 20);
      return futureDate;
    })(),
    hasEverybodyGuessed: false,
  },
};

export const Incorrect: Story = {
  args: {
    status: "danger",
    roundNumber: 1,
    speedBonus: 0,
    roundUrl: "thumbnails3/webusers/2017/03/it_om_1341g_001.jpg",
    correctAuthor: {
      personcode: "CB",
      fullname: "Carl Barks",
      nationalitycountrycode: "us",
    },
    nextRoundStartDate: (() => {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 20);
      return futureDate;
    })(),
    hasEverybodyGuessed: false,
  },
};

export const LastRound: Story = {
  args: {
    status: "success",
    roundNumber: 7,
    speedBonus: 12,
    roundUrl: "webusers/webusers-auth/rsc_ommi0o.png",
    correctAuthor: {
      personcode: "CB",
      fullname: "Carl Barks",
      nationalitycountrycode: "us",
    },
    nextRoundStartDate: null,
    hasEverybodyGuessed: false,
  },
};
