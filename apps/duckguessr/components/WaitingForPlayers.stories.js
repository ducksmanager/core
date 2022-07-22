import { useCookies } from '@vueuse/integrations/useCookies'
import WaitingForPlayers from '~/components/WaitingForPlayers'

export default {
  title: 'WaitingForPlayers',
}

const Template = (args) => ({
  components: { WaitingForPlayers },
  setup() {
    useCookies().set('duckguessr-user', 'brunoperel', {
      expires: new Date(new Date().getTime() + 3600000),
      path: '/',
    })
    return { args }
  },
  template: '<WaitingForPlayers v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  gameId: 123,
  players: [{ username: 'brunoperel', avatar: 'DD', id: 33 }],
  isBotAvailable: false,
  gamePlayersStats: [
    { medal_type: 'published-fr-recent', player_id: 33, points: 186 },
    { medal_type: 'it', player_id: 33, points: 12 },
    { medal_type: 'ultra_fast', player_id: 33, points: 1 },
    { medal_type: 'fast', player_id: 33, points: 5 },
  ],
}

export const WithPotentialBot = Template.bind({})
WithPotentialBot.args = {
  gameId: 123,
  players: [
    { username: 'brunoperel', avatar: 'US', id: 33 },
    { username: 'Wizyx', avatar: 'US', id: 34 },
    { username: 'remifanpicsou', avatar: 'US', id: 35 },
  ],
  isBotAvailable: true,
  gamePlayersStats: [
    { medal_type: 'published-fr-recent', player_id: 33, points: 186 },
    { medal_type: 'us', player_id: 34, points: 12 },
    { medal_type: 'ultra_fast', player_id: 34, points: 12 },
  ],
}
