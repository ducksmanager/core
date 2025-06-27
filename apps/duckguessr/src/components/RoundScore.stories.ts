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
    scoreTypeName: {
      control: "text",
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
    scoreTypeName: "Score type 1",
    players: [
      {
        id: 1,
        username: "Wizyx",
      },
    ],
    score: {
      player_id: 1,
      score: 10,
      speedBonus: 5,
      score_type_name: "Correct author",
      time_spent_guessing: 2500,
    },
    roundDuration: 1000,
  },
};

export const InGame: Story = {
  args: {
    inGame: true,
    scoreTypeName: "Score type 1",
    players: [
      {
        id: 1,
        username: "Wizyx",
      },
    ],
    score: {
      player_id: 1,
      score: 10,
      speedBonus: 5,
      score_type_name: "Correct author",
      time_spent_guessing: 2500,
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
      },
    ],
    score: {
      player_id: 1,
      score: null,
      speedBonus: null,
      time_spent_guessing: 2500,
    },
    roundDuration: 10000,
  },
};

export const InGameWrongAuthor: Story = {
  args: {
    inGame: true,
    scoreTypeName: "Score type 1",
    players: [
      {
        id: 1,
        username: "Wizyx",
      },
    ],
    score: {
      player_id: 1,
      score: 0,
      speedBonus: 5,
      score_type_name: "Wrong author",
      time_spent_guessing: 3000,
    },
    roundDuration: 10000,
  },
};
