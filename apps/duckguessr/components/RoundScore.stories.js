import RoundScore from '~/components/RoundScore'

export default {
  title: 'RoundScore',
}

const Template = (args) => ({
  components: { RoundScore },
  setup() {
    return { args }
  },
  template: '<round-score v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  scoreTypeName: 'Score type 1',
  score: 10,
  speedBonus: 5,
}
