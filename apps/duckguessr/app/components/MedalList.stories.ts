import type { Meta, StoryObj } from "@nuxtjs/storybook";

import MedalList from "./MedalList.vue";

const meta: Meta<typeof MedalList> = {
  title: "MedalList",
  component: MedalList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    withDetails: {
      control: "boolean",
    },
    cols: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutDataset: Story = {
  args: {
    dataset: null,
    withDetails: false,
    statsOverride: [
      { medalType: "published-fr-recent", playerId: 1, playerPoints: 143 },
      { medalType: "fast", playerId: 1, playerPoints: 150 },
      { medalType: "it", playerId: 1, playerPoints: 100 },
      { medalType: "ultra_fast", playerId: 1, playerPoints: 48 },
      { medalType: "us", playerId: 1, playerPoints: 48 },
    ],
    cols: 4,
  },
};

export const WithoutDatasetLowPoints: Story = {
  args: {
    dataset: null,
    withDetails: false,
    statsOverride: [
      { medalType: "fast", playerId: 1, playerPoints: 5 },
      { medalType: "it", playerId: 1, playerPoints: 10 },
      { medalType: "published-fr-recent", playerId: 1, playerPoints: 10 },
      { medalType: "ultra_fast", playerId: 1, playerPoints: 1 },
      { medalType: "us", playerId: 1, playerPoints: 10 },
    ],
    cols: 4,
  },
};
