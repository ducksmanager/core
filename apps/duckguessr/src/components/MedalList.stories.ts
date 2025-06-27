import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MedalList from "~/components/MedalList.vue";

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
      { medal_type: "published-fr-recent", points: 143 },
      { medal_type: "fast", points: 150 },
      { medal_type: "it", points: 100 },
      { medal_type: "ultra_fast", points: 48 },
      { medal_type: "us", points: 48 },
    ],
    cols: 4,
  },
};

export const WithoutDatasetLowPoints: Story = {
  args: {
    dataset: null,
    withDetails: false,
    statsOverride: [
      { medal_type: "fast", points: 5 },
      { medal_type: "it", points: 10 },
      { medal_type: "published-fr-recent", points: 10 },
      { medal_type: "ultra_fast", points: 1 },
      { medal_type: "us", points: 10 },
    ],
    cols: 4,
  },
};
