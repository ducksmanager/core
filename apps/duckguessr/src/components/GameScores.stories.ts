import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useCookies } from "@vueuse/integrations/useCookies";
import GameScores from "~/components/GameScores.vue";

const meta: Meta<typeof GameScores> = {
  title: "GameScores",
  component: GameScores,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    gameId: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: 100,
    players: [
      {
        player_id: 1,
        player: {
          id: 1,
          username: "player 1",
        },
      },
      {
        player_id: 2,
        player: {
          id: 2,
          username: "player 2",
        },
      },
    ],
    authors: [
      {
        personcode: "DR",
        personnationality: "us",
        personfullname: "Don Rosa",
      },
      {
        personcode: "CB",
        personnationality: "us",
        personfullname: "Carl Barks",
      },
      {
        personcode: "RSc",
        personnationality: "it",
        personfullname: "Romano Scarpa",
      },
    ],
    rounds: [
      {
        personcode: "DR",
        round_number: 1,
        sitecode_url: "thumbnails3/webusers/2014/04/hu_mm1992_07e_001.jpg",
        round_scores: [
          {
            player_id: 1,
            score_type_name: "Correct author",
            score: 10,
          },
        ],
      },
      {
        personcode: "CB",
        round_number: 2,
        sitecode_url: "thumbnails3/webusers/2017/03/it_om_1341g_001.jpg",
        round_scores: [
          {
            player_id: 1,
            score_type_name: "Correct author",
            score: 10,
          },
          {
            player_id: 2,
            score_type_name: "Correct author",
            score: 10,
          },
        ],
      },
      {
        personcode: "RSc",
        round_number: 3,
        sitecode_url: "webusers/webusers-auth/rsc_ommi0o.png",
        round_scores: [],
      },
    ],
  },
  decorators: [
    () => ({
      setup() {
        useCookies().set("duckguessr-id", 1);
      },
    }),
  ],
};
