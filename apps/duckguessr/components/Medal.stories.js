import Medal from '~/components/Medal'

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
  level: 3,
  type: 'Magazine_Francais',
}
export const Gold30Pct = Template.bind({})
Gold30Pct.args = {
  level: 3,
  type: 'Magazine_Francais',
  levelPercentage: 30,
}
export const Gold30PctProgress10Pct = Template.bind({})
Gold30PctProgress10Pct.args = {
  level: 3,
  type: 'Magazine_Francais',
  levelPercentage: 30,
  levelPercentageProgress: 10,
}

export const Silver = Template.bind({})
Silver.args = {
  level: 2,
  type: 'Rapide',
}
export const Bronze = Template.bind({})
Bronze.args = {
  level: 1,
  type: 'Americain',
}
