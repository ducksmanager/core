import preview from "../../.storybook/preview";
import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PlayerInfo from "./PlayerInfo.vue";

const meta = preview.meta({
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
});

export const Default = meta.story({
  args: {
    username: "remifanpicsou",
  },
});

export const TopPlayer = meta.story({
  args: {
    username: "remifanpicsou",
    topPlayer: true,
  },
});

export const Bot = meta.story({
  args: {
    username: "bot_us",
  },
});

export const BotRemovable = meta.story({
  args: {
    username: "bot_us",
    toggleable: true,
  },
});

export const PotentialBot = meta.story({
  args: {
    username: "potential_bot",
  },
});

export const CustomAvatar = meta.story({
  args: {
    username: "brunoperel",
    avatar: "US",
  },
});
