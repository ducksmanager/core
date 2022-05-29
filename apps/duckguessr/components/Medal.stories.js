import Medal from '~/components/Medal'
import { MedalLevelAndProgress } from '~/types/playerStats'

export default {
  title: 'Medal',
}

const Template = (args) => ({
  components: { Medal },
  setup() {
    return { args }
  },
  template: '<Medal v-bind="args" />',
})
export const Gold = Template.bind({})
Gold.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 0, 0, 0, 0),
  type: 'Magazine_Francais',
}
export const Gold30Pct = Template.bind({})
Gold30Pct.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 30, 0, 30, 0),
  type: 'Magazine_Francais',
}
export const Gold30PctProgress10Pct = Template.bind({})
Gold30PctProgress10Pct.args = {
  level: 3,
  type: 'Magazine_Francais',
  medalLevelAndProgress: new MedalLevelAndProgress(2, 30, 10, 30, 10),
}

export const Silver = Template.bind({})
Silver.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(1, 0, 0, 0, 0),
  type: 'fast',
}
export const Bronze = Template.bind({})
Bronze.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(0, 0, 0, 0, 0),
  type: 'Americain',
}
