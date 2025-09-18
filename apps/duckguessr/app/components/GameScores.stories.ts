import type { Meta, StoryObj } from "@nuxtjs/storybook";

import type { player } from "~duckguessr-prisma-browser";

import GameScores from "./GameScores.vue";

const meta: Meta<typeof GameScores> = {
  title: "GameScores",
  component: GameScores,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const players: player[] = [
  {
    id: 1,
    username: "player 1",
    ducksmanagerId: 1,
    avatar: "DD",
  },
  {
    id: 2,
    username: "player 2",
    ducksmanagerId: 2,
    avatar: "DD",
  },
];

export const Default: Story = {
  args: {
    game: {
      datasetId: 1,
      dataset: {
        id: 1,
        name: "dataset",
        title: "dataset",
        description: "dataset",
        active: true,
      },
      rounds: [
        {
          id: 1,
          startedAt: new Date(),
          finishedAt: new Date(),
          gameId: 100,
          roundNumber: 1,
          sitecodeUrl: "thumbnails3/webusers/2014/04/hu_mm1992_07e_001.jpg",
          roundScores: [
            {
              id: 1,
              roundId: 1,
              playerId: 1,
              scoreTypeName: "Correct author",
              score: 10,
              timeSpentGuessing: 10,
              speedBonus: 10,
            },
          ],
        },
        {
          id: 2,
          startedAt: new Date(),
          finishedAt: new Date(),
          gameId: 100,
          roundNumber: 2,
          sitecodeUrl: "thumbnails3/webusers/2017/03/it_om_1341g_001.jpg",
          roundScores: [
            {
              id: 1,
              roundId: 2,
              playerId: 1,
              scoreTypeName: "Correct author",
              score: 10,
              timeSpentGuessing: 10,
              speedBonus: 10,
            },
            {
              id: 2,
              roundId: 2,
              playerId: 2,
              scoreTypeName: "Correct author",
              score: 10,
              timeSpentGuessing: 10,
              speedBonus: 10,
            },
          ],
        },
        {
          id: 3,
          startedAt: new Date(),
          finishedAt: new Date(),
          gameId: 100,
          roundNumber: 3,
          sitecodeUrl: "webusers/webusers-auth/rsc_ommi0o.png",
          roundScores: [],
        },
      ],
      createdAt: new Date(),
      startedAt: new Date(),
      finishedAt: new Date(),
      id: 100,
      gamePlayers: [
        {
          id: 1,
          gameId: 100,
          playerId: 1,
          player: players[0],
        },
        {
          id: 2,
          gameId: 100,
          playerId: 2,
          player: players[1],
        },
      ],
      authors: [
        {
          personcode: "DR",
          nationalitycountrycode: "us",
          fullname: "Don Rosa",
        },
        {
          personcode: "CB",
          nationalitycountrycode: "us",
          fullname: "Carl Barks",
        },
        {
          personcode: "RSc",
          nationalitycountrycode: "it",
          fullname: "Romano Scarpa",
        },
      ],
    },
  },
};
