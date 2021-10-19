import RoundScores from '~/components/RoundScores'

export default {
  title: 'RoundScores',
}

const Template = (args) => ({
  components: { RoundScores },
  setup() {
    return { args }
  },
  template: '<RoundScores v-bind="args" />',
})
export const Default = Template.bind({})
Default.args = {
  scores: {
    'Score type 1': 1,
    'Score type 2': 10,
  },
}
