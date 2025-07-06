import type { Meta, StoryObj } from "@storybook/vue3-vite";

import RoundScore from "~/components/RoundScore.vue";

const meta: Meta<typeof RoundScore> = {
  title: "RoundScore",
  component: RoundScore,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    inGame: {
      control: "boolean",
    },
    roundDuration: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "https://example.com/avatar.png",
      },
    ],
    score: {
      id: 1,
      roundId: 1,
      playerId: 1,
      score: 10,
      speedBonus: 5,
      scoreTypeName: "Correct author",
      timeSpentGuessing: 2500,
    },
    roundDuration: 1000,
  },
};

export const InGame: Story = {
  args: {
    inGame: true,
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "https://example.com/avatar.png",
      },
    ],
    score: {
      id: 1,
      roundId: 1,
      playerId: 1,
      score: 10,
      speedBonus: 5,
      scoreTypeName: "Correct author",
      timeSpentGuessing: 2500,
    },
    roundDuration: 10000,
  },
};

export const InGameNotGuessedYet: Story = {
  args: {
    inGame: true,
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "https://example.com/avatar.png",
      },
    ],
    score: {
      id: 1,
      roundId: 1,
      playerId: 1,
      score: 0,
      speedBonus: 0,
      scoreTypeName: "Correct author",
      timeSpentGuessing: 2500,
    },
    roundDuration: 10000,
  },
};

export const InGameWrongAuthor: Story = {
  args: {
    inGame: true,
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "https://example.com/avatar.png",
      },
    ],
    score: {
      id: 1,
      roundId: 1,
      playerId: 1,
      score: 0,
      speedBonus: 5,
      scoreTypeName: "Wrong author",
      timeSpentGuessing: 3000,
    },
    roundDuration: 10000,
  },
};
