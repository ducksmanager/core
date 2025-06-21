import type { Meta, StoryObj } from '@storybook/vue3';
import { useCookies } from "@vueuse/integrations/useCookies";
import WaitingForPlayers from "~/components/WaitingForPlayers.vue";

const meta: Meta<typeof WaitingForPlayers> = {
  title: "WaitingForPlayers",
  component: WaitingForPlayers,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    gameId: {
      control: 'number',
    },
    isBotAvailable: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gameId: 123,
    players: [{ username: "brunoperel", avatar: "DD", id: 33 }],
    isBotAvailable: false,
    gamePlayersStats: [
      { medal_type: "published-fr-recent", player_id: 33, points: 186 },
      { medal_type: "it", player_id: 33, points: 12 },
      { medal_type: "ultra_fast", player_id: 33, points: 1 },
      { medal_type: "fast", player_id: 33, points: 5 },
    ],
  },
  decorators: [
    () => ({
      setup() {
        useCookies().set("duckguessr-user", "brunoperel", {
          expires: new Date(new Date().getTime() + 3600000),
          path: "/",
        });
      },
    }),
  ],
};

export const WithPotentialBot: Story = {
  args: {
    gameId: 123,
    players: [
      { username: "brunoperel", avatar: "US", id: 33 },
      { username: "Wizyx", avatar: "US", id: 34 },
      { username: "remifanpicsou", avatar: "US", id: 35 },
    ],
    isBotAvailable: true,
    gamePlayersStats: [
      { medal_type: "published-fr-recent", player_id: 33, points: 186 },
      { medal_type: "us", player_id: 34, points: 12 },
      { medal_type: "ultra_fast", player_id: 34, points: 12 },
    ],
  },
  decorators: [
    () => ({
      setup() {
        useCookies().set("duckguessr-user", "brunoperel", {
          expires: new Date(new Date().getTime() + 3600000),
          path: "/",
        });
      },
    }),
  ],
};
