import MedalList from '~/components/MedalList'
export default {
  title: 'MedalList',
}

const Template = (args) => ({
  components: { MedalList },
  setup() {
    return { args }
  },
  template: '<MedalList v-bind="args" />',
})
export const WithoutDataset = Template.bind({})
WithoutDataset.args = {
  dataset: null,
  withDetails: false,
  statsOverride: {
    'published-fr-recent': 143,
    fast: 150,
    ultra_fast: 48,
  },
}
export const WithoutDatasetLowPoints = Template.bind({})
WithoutDatasetLowPoints.args = {
  dataset: null,
  withDetails: false,
  statsOverride: {
    fast: 5,
    'published-fr-recent': 183,
    ultra_fast: 1,
  },
}
