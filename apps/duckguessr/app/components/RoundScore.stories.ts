import preview from "../../.storybook/preview";
import type { Meta, StoryObj } from "@nuxtjs/storybook";

import RoundScore from "./RoundScore.vue";

const meta = preview.meta({
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
});

export const Default = meta.story({
  args: {
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "DD",
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
});

export const InGame = meta.story({
  args: {
    inGame: true,
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "DD",
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
});

export const InGameNotGuessedYet = meta.story({
  args: {
    inGame: true,
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "DD",
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
});

export const InGameWrongAuthor = meta.story({
  args: {
    inGame: true,
    players: [
      {
        id: 1,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "DD",
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
});
