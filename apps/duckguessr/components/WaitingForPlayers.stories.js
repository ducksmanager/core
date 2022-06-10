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
  usernames: [
    'brunoperel',
    'Wizyx',
    'remifanpicsou',
    'Alex Puaud',
    'GlxbltHugo',
    'Picsou22',
    'bot_us',
  ],
  isBotAvailable: false,
}

export const WithPotentialBot = Template.bind({})
WithPotentialBot.args = {
  gameId: 123,
  usernames: ['brunoperel', 'Wizyx', 'remifanpicsou'],
  isBotAvailable: true,
}
