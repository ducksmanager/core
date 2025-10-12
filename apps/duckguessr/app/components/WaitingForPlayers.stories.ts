import type { Meta, StoryObj } from "@nuxtjs/storybook";

import WaitingForPlayers from "./WaitingForPlayers.vue";

const meta: Meta<typeof WaitingForPlayers> = {
  title: "WaitingForPlayers",
  component: WaitingForPlayers,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    gameId: {
      control: "number",
    },
    isBotAvailable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: 123,
    players: [
      { username: "brunoperel", avatar: "DD", id: 33, ducksmanagerId: 1 },
    ],
    isBotAvailable: false,
    gamePlayersStats: [
      { medalType: "published-fr-recent", playerId: 33, playerPoints: 186 },
      { medalType: "it", playerId: 33, playerPoints: 12 },
      { medalType: "ultra_fast", playerId: 33, playerPoints: 1 },
      { medalType: "fast", playerId: 33, playerPoints: 5 },
    ],
  },
};

export const WithPotentialBot: Story = {
  args: {
    gameId: 123,
    players: [
      { username: "brunoperel", avatar: "US", id: 33, ducksmanagerId: 1 },
      { username: "Wizyx", avatar: "US", id: 34, ducksmanagerId: 1 },
      { username: "remifanpicsou", avatar: "US", id: 35, ducksmanagerId: 1 },
    ],
    isBotAvailable: true,
    gamePlayersStats: [
      { medalType: "published-fr-recent", playerId: 33, playerPoints: 186 },
      { medalType: "us", playerId: 34, playerPoints: 12 },
      { medalType: "ultra_fast", playerId: 34, playerPoints: 12 },
    ],
  },
};
