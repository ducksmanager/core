import preview from "../../.storybook/preview";
import type { Meta, StoryObj } from "@nuxtjs/storybook";

import PodiumComponent from "./PodiumComponent.vue";

const meta = preview.meta({
  title: "Podium",
  component: PodiumComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
});

export const Default = meta.story({
  args: {
    players: [
      {
        id: 123,
        username: "remifanpicsou",
        sumScore: 1000,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 456,
        username: "Wizyx",
        sumScore: 100,
        ducksmanagerId: 456,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 789,
        username: "brunoperel",
        sumScore: 20,
        ducksmanagerId: 789,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 999,
        username: "demo",
        sumScore: 19,
        ducksmanagerId: 999,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 18,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 17,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 16,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 15,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 14,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 13,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 12,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 11,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 10,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 9,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 8,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 7,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 6,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 5,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 4,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 3,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
      {
        id: 123,
        username: "loser",
        sumScore: 2,
        ducksmanagerId: 123,
        avatar: "https://example.com/avatar.png",
      },
    ],
  },
});
