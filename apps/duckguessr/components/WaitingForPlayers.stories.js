import WaitingForPlayers from '~/components/WaitingForPlayers'

export default {
  title: 'WaitingForPlayers',
}

const Template = (args) => ({
  components: { WaitingForPlayers },
  setup() {
    return { args }
  },
  template: '<WaitingForPlayers v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  gameId: 123,
  usernames: ['brunoperel', 'Wizyx', 'remifanpicsou', 'Alex Puaud', 'GlxbltHugo', 'Picsou22'],
}
