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
  type: 'published-fr-recent',
}
export const Gold10Pct = Template.bind({})
Gold10Pct.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 10, 0, 10, 0),
  type: 'published-fr-recent',
}
export const Gold90Pct = Template.bind({})
Gold90Pct.args = {
  medalLevelAndProgress: new MedalLevelAndProgress(2, 90, 0, 90, 0),
  type: 'published-fr-recent',
}
export const Gold30PctProgress10Pct = Template.bind({})
Gold30PctProgress10Pct.args = {
  level: 3,
  type: 'published-fr-recent',
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
