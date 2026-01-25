import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PlayerInfo from "./PlayerInfo.vue";

const meta: Meta<typeof PlayerInfo> = {
  title: "PlayerInfo",
  component: PlayerInfo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    username: {
      control: "text",
    },
    topPlayer: {
      control: "boolean",
    },
    toggleable: {
      control: "boolean",
    },
    avatar: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    username: "remifanpicsou",
  },
};

export const TopPlayer: Story = {
  args: {
    username: "remifanpicsou",
    topPlayer: true,
  },
};

export const Bot: Story = {
  args: {
    username: "bot_us",
  },
};

export const BotRemovable: Story = {
  args: {
    username: "bot_us",
    toggleable: true,
  },
};

export const PotentialBot: Story = {
  args: {
    username: "potential_bot",
  },
};

export const CustomAvatar: Story = {
  args: {
    username: "brunoperel",
    avatar: "US",
  },
};
