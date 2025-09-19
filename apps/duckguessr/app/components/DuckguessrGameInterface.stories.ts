import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DuckguessrGameInterface from "./DuckguessrGameInterface.vue";

const meta: Meta<typeof DuckguessrGameInterface> = {
  title: "DuckguessrGameInterface",
  component: DuckguessrGameInterface,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    userAvatar: {
      control: "text",
      description: "URL of the user's avatar image",
    },
    comicImage: {
      control: "text",
      description: "URL of the comic panel image",
    },
    timerProgress: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Progress of the timer (0-100)",
    },
    cardSlots: {
      control: "object",
      description: "Array of card slot objects",
    },
    players: {
      control: "object",
      description: "Array of player objects",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userAvatar: "/avatars/DD.png",
    comicImage:
      "https://inducks.org/hr.php?image=https://outducks.org/thumbnails3/webusers/2015/12/it_tl_0125c_001.jpg&normalsize=1",
    timerProgress: 15,
    cardSlots: Array(9).fill({ filled: false }),
    players: [
      { name: "Player 1", avatar: "/avatars/DD.png", score: 75 },
      { name: "Player 2", avatar: "/avatars/DD.png", score: 60 },
      { name: "Player 3", avatar: "/avatars/DD.png", score: 45 },
    ],
  },
};

export const WithFilledCards: Story = {
  args: {
    ...Default.args,
    cardSlots: [
      { filled: true, image: "/avatars/DD.png" },
      { filled: true, image: "/avatars/DD.png" },
      { filled: true, image: "/avatars/DD.png" },
      { filled: true, image: "/avatars/DD.png" },
      { filled: false },
      { filled: true, image: "/avatars/DD.png" },
      { filled: true, image: "/avatars/DD.png" },
      { filled: true, image: "/avatars/DD.png" },
      { filled: true, image: "/avatars/DD.png" },
    ],
  },
};

export const LowTimer: Story = {
  args: {
    ...Default.args,
    timerProgress: 5,
  },
};

export const HighTimer: Story = {
  args: {
    ...Default.args,
    timerProgress: 85,
  },
};

export const DifferentPlayers: Story = {
  args: {
    ...Default.args,
    players: [
      { name: "Alice", avatar: "/avatars/DD.png", score: 90 },
      { name: "Bob", avatar: "/avatars/DD.png", score: 30 },
      { name: "Charlie", avatar: "/avatars/DD.png", score: 65 },
    ],
  },
};

export const EmptyCardSlots: Story = {
  args: {
    ...Default.args,
    cardSlots: Array(9).fill({ filled: false }),
  },
};

export const MixedCardSlots: Story = {
  args: {
    ...Default.args,
    cardSlots: [
      { filled: true, image: "/avatars/DD.png" },
      { filled: false },
      { filled: true, text: "A" },
      { filled: false },
      { filled: true, image: "/avatars/DD.png" },
      { filled: false },
      { filled: true, text: "B" },
      { filled: true, image: "/avatars/DD.png" },
      { filled: false },
    ],
  },
};
