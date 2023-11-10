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
  statsOverride: [
    { medal_type: 'published-fr-recent', points: 143 },
    { medal_type: 'fast', points: 150 },
    { medal_type: 'it', points: 100 },
    { medal_type: 'ultra_fast', points: 48 },
    { medal_type: 'us', points: 48 },
  ],
  cols: 4,
}
export const WithoutDatasetLowPoints = Template.bind({})
WithoutDatasetLowPoints.args = {
  dataset: null,
  withDetails: false,
  statsOverride: [
    { medal_type: 'fast', points: 5 },
    { medal_type: 'it', points: 10 },
    { medal_type: 'published-fr-recent', points: 10 },
    { medal_type: 'ultra_fast', points: 1 },
    { medal_type: 'us', points: 10 },
  ],
  cols: 4,
}
