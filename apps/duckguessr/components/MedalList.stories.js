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
    it: 100,
    ultra_fast: 48,
    us: 48,
  },
}
export const WithoutDatasetLowPoints = Template.bind({})
WithoutDatasetLowPoints.args = {
  dataset: null,
  withDetails: false,
  statsOverride: {
    fast: 5,
    it: 10,
    'published-fr-recent': 10,
    ultra_fast: 1,
    us: 10,
  },
}
