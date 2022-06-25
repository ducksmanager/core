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
  players: [
    { username: 'brunoperel', avatar: 'DD' },
    { username: 'Wizyx', avatar: 'DD' },
    { username: 'remifanpicsou', avatar: 'DD' },
    { username: 'Alex Puaud', avatar: 'DD' },
    { username: 'GlxbltHugo', avatar: 'DD' },
    { username: 'Picsou22', avatar: 'DD' },
    { username: 'bot_us', avatar: 'DD' },
  ],
  isBotAvailable: false,
}

export const WithPotentialBot = Template.bind({})
WithPotentialBot.args = {
  gameId: 123,
  players: [
    { username: 'brunoperel', avatar: 'US' },
    { username: 'Wizyx', avatar: 'US' },
    { username: 'remifanpicsou', avatar: 'US' },
  ],
  isBotAvailable: true,
}
