import type { Meta, StoryObj } from "@storybook/vue3-vite";

import GameComponent from "~/components/GameComponent.vue";

const meta: Meta<typeof GameComponent> = {
  title: "GameComponent",
  component: GameComponent,

  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    availableTime: {
      control: "number",
    },
    remainingTime: {
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
    availableTime: 15,
    currentRound: {
      id: 10,
      personcode: "DR",
      gameId: 1,
      nationalitycountrycode: "us",
      fullname: "Don Rosa",
      roundNumber: 2,
      startedAt: new Date("2022-05-21T00:00:00"),
      finishedAt: new Date("2022-05-21T00:01:00"),
      roundScores: [
        {
          id: 100,
          playerId: 1,
          roundId: 10,
          scoreTypeName: "Correct author",
          score: 100,
          speedBonus: 10,
          timeSpentGuessing: 20 * 1000,
        },
        {
          id: 101,
          playerId: 3,
          roundId: 10,
          scoreTypeName: "Wrong author",
          score: 0,
          speedBonus: 0,
          timeSpentGuessing: 10 * 1000,
        },
      ],
      sitecodeUrl: "thumbnails3/webusers/2008/09/us_zz1966b23x_001.jpg",
    },
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
      { personcode: "DR", nationalitycountrycode: "us", fullname: "Don Rosa" },
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
      { personcode: "DR", nationalitycountrycode: "us", fullname: "Don Rosa" },
      {
        personcode: "RSc",
        nationalitycountrycode: "us",
        fullname: "Romano Scarpa",
      },
    ],
    players: [
      {
        id: 1,
        username: "brunoperel",
        ducksmanagerId: 117,
        avatar: "DD",
      },
      {
        id: 2,
        username: "Wizyx",
        ducksmanagerId: 1,
        avatar: "DD",
      },
      {
        id: 3,
        username: "remifanpicsou",
        ducksmanagerId: 3,
        avatar: "DD",
      },
    ],
    previousPersoncodes: ["CB", "DR"],
    remainingTime: 5,
    hasEverybodyGuessed: false,
  },
};
