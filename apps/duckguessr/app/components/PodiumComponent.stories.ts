import type { Meta, StoryObj } from "@storybook/vue3-vite";

import PodiumComponent from "~/components/PodiumComponent.vue";

const meta: Meta<typeof PodiumComponent> = {
  title: "Podium",
  component: PodiumComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    players: [
      {
        id: 123,
        username: "remifanpicsou",
        sumScore: 1000,
      },
      {
        id: 456,
        username: "Wizyx",
        sumScore: 100,
      },
      {
        id: 789,
        username: "brunoperel",
        sumScore: 20,
      },
      {
        id: 999,
        username: "demo",
        sumScore: 19,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 18,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 17,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 16,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 15,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 14,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 13,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 12,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 11,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 10,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 9,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 8,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 7,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 6,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 5,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 4,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 3,
      },
      {
        id: 123,
        username: "loser",
        sumScore: 2,
      },
    ],
  },
};
