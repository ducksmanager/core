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
