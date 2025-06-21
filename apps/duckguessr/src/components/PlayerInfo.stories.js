import PlayerInfo from '~/components/PlayerInfo'

export default {
  title: 'PlayerInfo',
}

const Template = (args) => ({
  components: { PlayerInfo },
  setup() {
    return { args }
  },
  template: '<PlayerInfo v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  username: 'remifanpicsou',
}

export const TopPlayer = Template.bind({})
TopPlayer.args = {
  username: 'remifanpicsou',
  topPlayer: true,
}
export const Bot = Template.bind({})
Bot.args = {
  username: 'bot_us',
}
export const BotRemovable = Template.bind({})
BotRemovable.args = {
  username: 'bot_us',
  toggleable: true,
}
export const PotentialBot = Template.bind({})
PotentialBot.args = {
  username: 'potential_bot',
}

export const CustomAvatar = Template.bind({})
CustomAvatar.args = {
  username: 'brunoperel',
  avatar: 'US',
}
