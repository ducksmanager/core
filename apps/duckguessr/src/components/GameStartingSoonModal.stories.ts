import type { Meta, StoryObj } from "@storybook/vue3-vite";
import GameStartingSoonModal from "~/components/GameStartingSoonModal.vue";

const meta: Meta<typeof GameStartingSoonModal> = {
  title: "GameStartingSoonModal",
  component: GameStartingSoonModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    firstRoundStartDate: {
      control: "date",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    authors: [
      {
        personcode: "CB",
        personnationality: "us",
        personfullname: "Carl Barks",
      },
      { personcode: "DR", personnationality: "us", personfullname: "Don Rosa" },
      {
        personcode: "RSc",
        personnationality: "us",
        personfullname: "Romano Scarpa",
      },
      {
        personcode: "CB",
        personnationality: "us",
        personfullname: "Carl Barks",
      },
      { personcode: "DR", personnationality: "us", personfullname: "Don Rosa" },
      {
        personcode: "RSc",
        personnationality: "us",
        personfullname: "Romano Scarpa",
      },
      {
        personcode: "CB",
        personnationality: "us",
        personfullname: "Carl Barks",
      },
      { personcode: "DR", personnationality: "us", personfullname: "Don Rosa" },
      {
        personcode: "RSc",
        personnationality: "us",
        personfullname: "Romano Scarpa",
      },
    ],
    firstRoundStartDate: (() => {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 20);
      return futureDate;
    })(),
  },
};
